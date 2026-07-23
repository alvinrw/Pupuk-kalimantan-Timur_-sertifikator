import re
from difflib import SequenceMatcher

def string_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a.lower(), b.lower()).ratio() * 100.0

def match_entity(file_name: str, extracted_metadata: dict, master_equipment_list: list) -> dict:
    """
    Melakukan pencocokan Fuzzy String Similarity antara hasil ekstraksi metadata
    dengan daftar Data Master Aset perusahaan.
    """
    ocr_asset_name = extracted_metadata.get("lokasi_objek_aset", "")
    ocr_cert_no = extracted_metadata.get("nomor_sertifikat", "")

    # Ambil angka pertama dari nama file sebagai petunjuk (misal "6495 IPP PKT...")
    fn_match = re.search(r'^([0-9]{4})', file_name)
    file_id_hint = fn_match.group(1) if fn_match else ""

    best_match = None
    highest_score = 0.0

    for item in master_equipment_list:
        tag_num = item.get("tagNumber", item.get("tag_number", ""))
        cert_num = item.get("certificateNo", item.get("certificate_no", ""))
        equip_name = item.get("name", "")

        score_tag = string_similarity(ocr_asset_name, tag_num)
        score_name = string_similarity(ocr_asset_name, equip_name)
        score_cert = string_similarity(ocr_cert_no, cert_num)

        asset_best_score = max(score_tag, score_name)

        # Bonus jika ID dari nama file cocok dengan nomor sertifikat master
        bonus = 30.0 if file_id_hint and file_id_hint in cert_num else 0.0

        total_score = (asset_best_score * 0.4) + (score_cert * 0.3) + bonus

        if total_score > highest_score:
            highest_score = total_score
            best_match = item

    confidence = min(100.0, round(highest_score, 1))
    system_action = "AUTO_LINKED" if confidence >= 75.0 else "MANUAL_REVIEW_REQUIRED"

    return {
        "matched_entity": best_match,
        "confidence_score": confidence,
        "system_action": system_action,
        "original_ocr_cert_no": ocr_cert_no,
        "corrected_cert_no": best_match.get("certificateNo", ocr_cert_no) if best_match and confidence >= 75.0 else ocr_cert_no
    }
