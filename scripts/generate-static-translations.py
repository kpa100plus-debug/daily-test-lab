#!/usr/bin/env python3
"""Generate static Korean-to-locale phrase dictionaries for DAILY TEST LAB.

The translation model is used only while generating committed JSON dictionaries.
No model, visitor text, API key, or runtime translation request is shipped to the site.
"""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
from typing import Iterable

import ctranslate2
from opencc import OpenCC
from transformers import M2M100Tokenizer


PROJECT_ROOT = Path(__file__).resolve().parents[1]
HANGUL = re.compile(r"[가-힣]")
JS_STRING = re.compile(
    r"(?s)(?:'((?:\\.|[^'\\])*)'|\"((?:\\.|[^\"\\])*)\"|`((?:\\.|[^`\\])*)`)"
)

TARGET_LANGUAGES = {
    "en": "en",
    "ja": "ja",
    "zh-CN": "zh",
    "es": "es",
    "fr": "fr",
    "de": "de",
    "pt": "pt",
    "id": "id",
    "th": "th",
    "vi": "vi",
    "hi": "hi",
    "ar": "ar",
    "ru": "ru",
}

# Loanwords and compact labels need domain context that a general model can miss.
MANUAL_OVERRIDES = {
    "zh-CN": {"짬뽕": "韩式辣海鲜面", "짜장면": "炸酱面", "고연봉 장거리": "高薪远距离通勤", "저연봉 근거리": "低薪近距离通勤", "짜장면 vs 짬뽕 국민 중식 밸런스 게임 | DAILY TEST LAB": "炸酱面还是韩式辣海鲜面？国民中餐二选一 | DAILY TEST LAB"},
    "zh-TW": {"짬뽕": "韓式辣海鮮麵", "짜장면": "炸醬麵", "고연봉 장거리": "高薪遠距離通勤", "저연봉 근거리": "低薪近距離通勤", "짜장면 vs 짬뽕 국민 중식 밸런스 게임 | DAILY TEST LAB": "炸醬麵還是韓式辣海鮮麵？國民中餐二選一 | DAILY TEST LAB"},
    "es": {"짬뽕": "Jjamppong (fideos picantes con marisco)"},
    "fr": {"짬뽕": "Jjamppong (nouilles épicées aux fruits de mer)"},
    "vi": {"떡볶이": "Tteokbokki (bánh gạo cay)", "쫄깃한 떡볶이": "Tteokbokki dai mềm"},
    "ar": {"짬뽕": "جامبونغ (نودلز بحرية حارة)"},
}

# Text assembled at runtime cannot always be discovered from rendered HTML.
RUNTIME_PHRASES = {
    "공유 완료",
    "내용·주소 복사됨",
    "공유 취소",
    "직접 복사",
    "정답입니다! 기억을 만드는 데 중요한 역할을 하는 부위는 해마예요.",
    "아쉬워요. 정답은 B. 해마입니다.",
    "첫 기록을 만들어보세요",
    "게임을 시작해 보세요",
    "게스트로 기록 중",
    "첫 기록 도전",
    "지금 플레이 →",
    "잠시 후 다시 시도해 주세요",
    "게임을 불러오지 못했어요",
    "잠시 후 새로고침해 주세요.",
    "취향이 거의 정확히 반으로 갈렸어요!",
    "한 번도 틀리지 않고 완주했어요!",
}


def normalize_text(value: str) -> str:
    return " ".join(value.split()).strip()


class VisibleTextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.strings: set[str] = set()
        self.ignored_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "noscript"}:
            self.ignored_depth += 1
        for name, value in attrs:
            if name not in {"aria-label", "title", "placeholder", "content"} or not value:
                continue
            text = normalize_text(value)
            if HANGUL.search(text):
                self.strings.add(text)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript"} and self.ignored_depth:
            self.ignored_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.ignored_depth:
            return
        text = normalize_text(data)
        if text and HANGUL.search(text):
            self.strings.add(text)


def walk_json(value: object) -> Iterable[str]:
    if isinstance(value, str):
        text = normalize_text(value)
        if HANGUL.search(text):
            yield text
        return
    if isinstance(value, list):
        for item in value:
            yield from walk_json(item)
        return
    if isinstance(value, dict):
        for item in value.values():
            yield from walk_json(item)


def extract_phrases() -> list[str]:
    phrases = set(RUNTIME_PHRASES)

    for path in (PROJECT_ROOT / "src" / "content").glob("*.json"):
        phrases.update(walk_json(json.loads(path.read_text(encoding="utf-8"))))

    html_roots = [PROJECT_ROOT / "src" / "site", PROJECT_ROOT / "dist"]
    for html_root in html_roots:
        if not html_root.exists():
            continue
        for path in html_root.rglob("*.html"):
            if "admin" in path.parts:
                continue
            parser = VisibleTextExtractor()
            parser.feed(path.read_text(encoding="utf-8"))
            phrases.update(parser.strings)

    script_paths = list((PROJECT_ROOT / "src" / "site" / "assets" / "js").glob("*.js"))
    for path in script_paths:
        if path.name in {"admin-app.js", "content-admin-engine.js"}:
            continue
        source = path.read_text(encoding="utf-8")
        for match in JS_STRING.finditer(source):
            value = next(group for group in match.groups() if group is not None)
            if "${" in value:
                continue
            text = normalize_text(bytes(value, "utf-8").decode("unicode_escape") if "\\u" in value else value)
            if text and HANGUL.search(text):
                phrases.add(text)

    return sorted(phrases, key=lambda value: (len(value), value))


def translate_locale(
    translator: ctranslate2.Translator,
    tokenizer: M2M100Tokenizer,
    phrases: list[str],
    target_language: str,
    batch_size: int,
) -> dict[str, str]:
    tokenizer.src_lang = "ko"
    translations: dict[str, str] = {}
    target_token = tokenizer.lang_code_to_token[target_language]

    for start in range(0, len(phrases), batch_size):
        batch = phrases[start : start + batch_size]
        sources = [tokenizer.convert_ids_to_tokens(tokenizer.encode(text)) for text in batch]
        prefixes = [[target_token] for _ in batch]
        results = translator.translate_batch(
            sources,
            target_prefix=prefixes,
            beam_size=2,
            max_decoding_length=256,
            repetition_penalty=1.08,
        )
        for source_text, result in zip(batch, results, strict=True):
            target_tokens = result.hypotheses[0][1:]
            translated = tokenizer.decode(
                tokenizer.convert_tokens_to_ids(target_tokens),
                skip_special_tokens=True,
            ).strip()
            translations[source_text] = translated or source_text

        completed = min(start + batch_size, len(phrases))
        print(f"{target_language}: {completed}/{len(phrases)}", flush=True)

    return translations


def write_dictionary(locale: str, translations: dict[str, str], model_name: str) -> None:
    output_directory = PROJECT_ROOT / "src" / "content" / "locales"
    output_directory.mkdir(parents=True, exist_ok=True)
    payload = {
        "schemaVersion": 1,
        "locale": locale,
        "sourceLocale": "ko",
        "model": model_name,
        "generatedAt": "2026-08-27",
        "translations": translations,
    }
    (output_directory / f"{locale}.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--batch-size", type=int, default=48)
    parser.add_argument("--locales", nargs="*", default=list(TARGET_LANGUAGES))
    args = parser.parse_args()

    phrases = extract_phrases()
    print(f"phrases: {len(phrases)} / characters: {sum(map(len, phrases))}", flush=True)

    tokenizer = M2M100Tokenizer.from_pretrained(args.model, local_files_only=True)
    translator = ctranslate2.Translator(
        args.model,
        device="cpu",
        compute_type="int8",
        inter_threads=1,
        intra_threads=min(8, os.cpu_count() or 4),
    )

    model_name = "michaelfeil/ct2fast-m2m100_418M (MIT)"
    generated: dict[str, dict[str, str]] = {}
    for locale in args.locales:
        if locale == "zh-TW":
            continue
        target_language = TARGET_LANGUAGES[locale]
        translations = translate_locale(
            translator,
            tokenizer,
            phrases,
            target_language,
            args.batch_size,
        )
        translations.update(MANUAL_OVERRIDES.get(locale, {}))
        generated[locale] = translations
        write_dictionary(locale, translations, model_name)

    if "zh-TW" in args.locales:
        simplified = generated.get("zh-CN")
        if simplified is None:
            simplified_path = PROJECT_ROOT / "src" / "content" / "locales" / "zh-CN.json"
            simplified = json.loads(simplified_path.read_text(encoding="utf-8"))["translations"]
        converter = OpenCC("s2twp")
        traditional = {source: converter.convert(target) for source, target in simplified.items()}
        traditional.update(MANUAL_OVERRIDES.get("zh-TW", {}))
        write_dictionary("zh-TW", traditional, model_name + " + OpenCC s2twp")


if __name__ == "__main__":
    main()
