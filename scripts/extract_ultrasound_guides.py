import json
import sys
from pathlib import Path

from docx import Document


TOPICS = [
    ('trusi', 0, 19),
    ('abdominal', 22, 46),
    ('kidneys', 54, 71),
    ('bladder', 74, 89),
    ('scrotum', 93, 111),
    ('soft-tissues', 114, 152),
    ('lymph-nodes', 155, 167),
    ('thyroid', 169, 199),
    ('salivary-glands', 202, 237),
    ('kidneys-bladder', 240, 255),
    ('breast', 258, 282),
    ('gallbladder-load', 285, 318),
    ('pelvic-floor', 323, 342),
    ('cervix-elastography', 345, 363),
    ('pelvic-3d', 367, 396),
    ('pregnancy-doppler', 400, 425),
    ('cervicometry', 430, 454),
    ('pubic-symphysis', 459, 496),
    ('early-pregnancy', 501, 527),
    ('leg-veins', 531, 550),
    ('leg-arteries', 554, 581),
    ('arm-veins', 585, 604),
    ('arm-arteries', 607, 625),
    ('neck-arteries', 629, 662),
    ('renal-vessels', 667, 695),
    ('joints', 698, 729),
    ('brain-vessels', 732, 756),
    ('liver-elastography', 760, 783),
    ('abdominal-aorta', 789, 821),
    ('nktg', 824, 850),
]


def clean(text):
    return ' '.join(text.replace('\xa0', ' ').split())


def is_procedure_heading(text):
    value = text.lower()
    return any(marker in value for marker in (
        'как проходит', 'как проводится', 'ход процедуры',
        'проведение исследования', 'проведение процедуры', 'порядок проведения',
    ))


def is_following_section(paragraph, text):
    runs = [run for run in paragraph.runs if run.text.strip()]
    if not runs or not all(run.bold for run in runs):
        return False
    value = text.lower().rstrip(':?')
    return value.startswith((
        'важные', 'что важно', 'что показывает', 'что оценивает',
        'противопоказания', 'несколько советов', 'показания',
    ))


def build_guide(paragraphs, start, end):
    rows = [(index, clean(paragraphs[index].text)) for index in range(start, end + 1)]
    rows = [(index, text) for index, text in rows if text]
    procedure_position = next(position for position, (_, text) in enumerate(rows) if is_procedure_heading(text))
    preparation_heading = next(
        (position for position, (_, text) in enumerate(rows[:procedure_position]) if 'подготов' in text.lower() and len(text) < 120),
        0,
    )
    title = rows[0][1]
    preparation = [text for _, text in rows[preparation_heading + 1:procedure_position]]
    procedure = []
    for index, text in rows[procedure_position + 1:]:
        if is_following_section(paragraphs[index], text):
            break
        procedure.append(text)
    return {'title': title, 'preparation': preparation, 'procedure': procedure}


def main():
    source = Path(sys.argv[1])
    document = Document(source)
    guides = {key: build_guide(document.paragraphs, start, end) for key, start, end in TOPICS}
    print('window.ME_ULTRASOUND_GUIDES = ' + json.dumps(guides, ensure_ascii=False, indent=2) + ';')


if __name__ == '__main__':
    main()
