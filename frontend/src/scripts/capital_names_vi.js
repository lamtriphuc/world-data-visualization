const capitapDictionary = {
    "London": "Luân Đôn",
    "Beijing": "Bắc Kinh",
    "Paris": "Pa-ri",
    "Moscow": "Mát-xcơ-va",
    "Washington, D.C.": "Oa-sinh-tơn",
    "Tokyo": "Tô-ky-ô",
    "Seoul": "Xơ-un",
    "Bangkok": "Băng Cốc",
    "Hanoi": "Hà Nội",
    "Vientiane": "Viêng Chăn",
    "Phnom Penh": "Phnôm Pênh",
    "Pyongyang": "Bình Nhưỡng",
    "Rome": "Rô-ma",
    "Berlin": "Béc-lin",
    "Vienna": "Viên",
    "Warsaw": "Vac-sa-va",
    "Prague": "Pra-ha",
    "Athens": "A-then",
    "Brussels": "Brúc-xen",
    "Copenhagen": "Cô-pen-ha-gen",
    "Lisbon": "Li-xbon",
    "Madrid": "Ma-đrít",
    "Stockholm": "Xtốc-khôm",
    "Havana": "La Ha-ba-na",
    "Mexico City": "Thành phố Mê-hi-cô",
    "New Delhi": "Niu Đê-li",
    "Jakarta": "Gia-các-ta",
    "Manila": "Ma-ni-la",
    "Singapore": "Xin-ga-po",
    "Kuala Lumpur": "Cu-a-la Lăm-pơ",
    "Kiev": "Ki-ép",
    "Canberra": "Can-bê-ra",
    "Bern": "Béc-nơ",
    "Ottawa": "Ốt-ta-oa",
    "Brasilia": "Bra-xi-li-a",
    "Cairo": "Cai-rô",
    "Algiers": "An-giê",
    "Ankara": "An-ca-ra",
    "Baghdad": "Bát-đa",
    "Jerusalem": "Giê-ru-sa-lem",
    "Tehran": "Tê-hê-ran",
    "Damascus": "Đa-mát",
    "Kabul": "Ca-bul",
    "Ulaanbaatar": "U-lan-ba-to",
    "Vatican City": "Va-ti-căng",
    "Buenos Aires": "Bu-ê-nốt Ai-rét",
    "Sofia": "Xô-phi-a",
    "Bucharest": "Bu-ca-rét",
    "Budapest": "Bu-đa-pét",
    "Helsinki": "Hen-sin-ki",
    "Oslo": "Ốt-xlo",
    "Copenhagen": "Cô-pen-ha-gen",
    "Luxembourg": "Lúc-xăm-bua",
    "Monaco": "Mô-na-cô",
    "Dhaka": "Đắc-ca",
    "Colombo": "Cô-lôm-bô",
    "Tripoli": "Tri-pô-li",
    "Tunis": "Tuy-ni",
    "Rabat": "Ra-bát",
    "Khartoum": "Khác-tum",
    "Mogadishu": "Mô-ga-đi-su",
    "Addis Ababa": "A-đi A-bê-ba",
    "Naypyidaw": "Nây-pi-đô",
    "Tashkent": "Tas-ken",
    "Ashgabat": "A-sgabat",
    "Bishkek": "Bít-kếk",
    "Dushanbe": "Đu-san-be",
    "Sana'a": "Xa-na",
    "Santiago": "Xan-ti-a-gô",
    "Caracas": "Ca-ra-cát",
    "Bogota": "Bô-gô-ta",
    "Lima": "Li-ma",
    "Quito": "Ki-tô",
    "Asuncion": "A-xun-xi-ông",
    "Montevideo": "Môn-tê-vi-đê-ô",
    "Wellington": "Oen-linh-tơn"
}

export const translateCapital = (capital) => {
    if (!capital) return '';

    let capStr = '';

    if (Array.isArray(capital)) {
        capStr = capital[0] || '';
    } else {
        capStr = String(capital);
    }

    const key = capStr.trim();

    if (capitapDictionary.hasOwnProperty(key)) {
        return capitapDictionary[key];
    }

    return key;
}