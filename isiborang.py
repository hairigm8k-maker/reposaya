import requests
import json
import time

# ============================
# CONFIG
# ============================
SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkdyKS9y-DEMd3ngrsRk4oSAMkFYohK5goT1Jj-nyZqY79a7ndCmarxlzSaxc_jdCD-w/exec"
# ============================

data_list = [
  {"nama":"Ahmad Faizal bin Ismail","email":"ahmad.faizal@gmail.com","notel":"0123456789","mesej":"Borang ini sangat mudah digunakan. Terima kasih!"},
  {"nama":"Siti Nurhaliza binti Omar","email":"sitihaliza88@yahoo.com","notel":"0134567890","mesej":"Saya cadangkan tambah pilihan bahasa Inggeris."},
  {"nama":"Muhammad Hafiz bin Razak","email":"hafiz.razak@gmail.com","notel":"0145678901","mesej":"Sistem laju dan responsif. Bagus!"},
  {"nama":"Nur Aisyah binti Yusof","email":"aisyah.yusof@outlook.com","notel":"0156789012","mesej":"Harap dapat tambah fungsi muat naik fail."},
  {"nama":"Lim Wei Ming","email":"weiming.lim@gmail.com","notel":"0167890123","mesej":"Antara muka kemas dan profesional."},
  {"nama":"Tan Mei Ling","email":"meiling.tan@hotmail.com","notel":"0178901234","mesej":"Saya suka reka bentuk warna. Sangat menarik."},
  {"nama":"Rajesh Kumar a/l Suresh","email":"rajesh.kumar@gmail.com","notel":"0189012345","mesej":"Boleh tambah dark mode tak?"},
  {"nama":"Priya Devi a/p Raman","email":"priya.devi@yahoo.com","notel":"0190123456","mesej":"Pengalaman pengguna sangat baik."},
  {"nama":"Chong Kah Wai","email":"kahwai.chong@gmail.com","notel":"0111234567","mesej":"Sila tambah pengesahan email automatik."},
  {"nama":"Nurul Izzati binti Hamid","email":"izzati.hamid@gmail.com","notel":"0122345678","mesej":"Borang ringkas dan mudah difahami."},
  {"nama":"Muhammad Amir bin Zulkifli","email":"amir.zul@gmail.com","notel":"0133456789","mesej":"Tambah sokongan untuk telefon bimbit lama."},
  {"nama":"Farah Nabila binti Salleh","email":"farah.nabila@yahoo.com","notel":"0144567890","mesej":"Sangat membantu untuk urusan harian."},
  {"nama":"Wong Chee Keong","email":"cheekeong.wong@gmail.com","notel":"0155678901","mesej":"Sila tambah pilihan kategori aduan."},
  {"nama":"Kavitha a/p Murugan","email":"kavitha.m@gmail.com","notel":"0166789012","mesej":"Sistem stabil tanpa sebarang masalah."},
  {"nama":"Ahmad Zaki bin Abdullah","email":"zakabdullah@gmail.com","notel":"0177890123","mesej":"Terima kasih atas perkhidmatan yang pantas."},
  {"nama":"Norhayati binti Mohd Noor","email":"hayati.noor@outlook.com","notel":"0188901234","mesej":"Borang ini senang untuk warga emas."},
  {"nama":"Syafiq Aiman bin Roslan","email":"syafiq.aiman@gmail.com","notel":"0199012345","mesej":"Cadangan: tambah emoji pada mesej."},
  {"nama":"Aina Sofea binti Aziz","email":"aina.sofea@gmail.com","notel":"0110123456","mesej":"Paparan bersih dan tidak mengelirukan."},
  {"nama":"Goh Hui Ling","email":"huiling.goh@yahoo.com","notel":"0121234567","mesej":"Sila tambah integrasi WhatsApp."},
  {"nama":"Suresh a/l Ramasamy","email":"suresh.rama@gmail.com","notel":"0132345678","mesej":"Borang ini menjimatkan masa saya."},
  {"nama":"Nurul Syazwani binti Kamal","email":"syazwani.kamal@gmail.com","notel":"0143456789","mesej":"Harap boleh eksport data ke PDF."},
  {"nama":"Mohd Firdaus bin Hassan","email":"firdaus.hassan@gmail.com","notel":"0154567890","mesej":"Cepat dan tepat. Tiada masalah."},
  {"nama":"Lee Jia Hui","email":"jiahui.lee@hotmail.com","notel":"0165678901","mesej":"Sila tambah auto-save pada borang."},
  {"nama":"Anis Farhana binti Idris","email":"anis.farhana@gmail.com","notel":"0176789012","mesej":"Sangat memuaskan. Teruskan usaha!"},
  {"nama":"Arun a/l Krishnan","email":"arun.krish@gmail.com","notel":"0187890123","mesej":"Boleh tambah pilihan tarikh?"},
  {"nama":"Cheah Wei Jie","email":"weijie.cheah@gmail.com","notel":"0198901234","mesej":"Reka bentuk moden dan kemas."},
  {"nama":"Nur Amalina binti Rahim","email":"amalina.rahim@yahoo.com","notel":"0119012345","mesej":"Sangat berguna untuk aduan pelanggan."},
  {"nama":"Muhammad Danish bin Othman","email":"danish.othman@gmail.com","notel":"0120123456","mesej":"Sila tambah butang reset borang."},
  {"nama":"Siti Hajar binti Bakar","email":"sitihajar.bakar@gmail.com","notel":"0131234567","mesej":"Pengalaman pertama yang menyeronokkan."},
  {"nama":"Yeoh Boon Hock","email":"boonhock.yeoh@outlook.com","notel":"0142345678","mesej":"Borang pantas dimuatkan."},
  {"nama":"Deepa a/p Shanmugam","email":"deepa.shan@gmail.com","notel":"0153456789","mesej":"Tambah pilihan keutamaan aduan."},
  {"nama":"Mohd Khairul bin Anuar","email":"khairul.anuar@gmail.com","notel":"0164567890","mesej":"Sistem ini mudah untuk pelajar."},
  {"nama":"Nur Fatin binti Zainal","email":"fatin.zainal@yahoo.com","notel":"0175678901","mesej":"Cadangan: tambah lapisan keselamatan."},
  {"nama":"Liew Chun Seng","email":"chunseng.liew@gmail.com","notel":"0186789012","mesej":"Bagus! Saya akan cadang kepada kawan."},
  {"nama":"Harpreet Kaur a/p Singh","email":"harpreet.kaur@gmail.com","notel":"0197890123","mesej":"Sila tambah pilihan bahasa Tamil."},
  {"nama":"Ahmad Syahmi bin Yusof","email":"syahmi.yusof@gmail.com","notel":"0118901234","mesej":"Antara muka sangat mesra pengguna."},
  {"nama":"Norain binti Mohd Yusof","email":"norain.yusof@hotmail.com","notel":"0129012345","mesej":"Harap tambah fungsi carian data."},
  {"nama":"Chin Wai Kit","email":"waikit.chin@gmail.com","notel":"0130123456","mesej":"Sistem ini sangat efisien."},
  {"nama":"Ramesh a/l Muthu","email":"ramesh.muthu@gmail.com","notel":"0141234567","mesej":"Tambah pilihan salinan emel kepada pengguna."},
  {"nama":"Nurul Nadia binti Fauzi","email":"nadia.fauzi@gmail.com","notel":"0152345678","mesej":"Borang ini memudahkan urusan saya."},
  {"nama":"Teoh Siang Wei","email":"siangwei.teoh@yahoo.com","notel":"0163456789","mesej":"Sangat memuaskan hati. Syabas!"},
  {"nama":"Mohd Rizal bin Ahmad","email":"rizal.ahmad@gmail.com","notel":"0174567890","mesej":"Sila tambah integrasi kalendar."},
  {"nama":"Kalaivani a/p Subramaniam","email":"kalaivani.s@gmail.com","notel":"0185678901","mesej":"Borang sesuai untuk semua peringkat umur."},
  {"nama":"Nur Syuhada binti Ismail","email":"syuhada.ismail@gmail.com","notel":"0196789012","mesej":"Tambah animasi pada butang hantar."},
  {"nama":"Ho Zhi Hao","email":"zhihao.ho@gmail.com","notel":"0117890123","mesej":"Pengalaman lancar tanpa lag."},
  {"nama":"Fatin Nur Aqilah binti Rosli","email":"aqilah.rosli@yahoo.com","notel":"0128901234","mesej":"Borang ini sesuai untuk kegunaan harian."},
  {"nama":"Muhammad Ikhwan bin Salleh","email":"ikhwan.salleh@gmail.com","notel":"0139012345","mesej":"Sila tambah sokongan berbilang bahasa."},
  {"nama":"Yap Li Wen","email":"liwen.yap@outlook.com","notel":"0140123456","mesej":"Reka bentuk bersih dan mudah difahami."},
  {"nama":"Shalini a/p Rajendran","email":"shalini.raj@gmail.com","notel":"0151234567","mesej":"Sistem ini sangat membantu. Terima kasih."},
  {"nama":"Abdul Rahman bin Mohd Ali","email":"rahman.ali@gmail.com","notel":"0162345678","mesej":"Borang lengkap dan mudah diisi. Bagus!"},
]

# ============================
# SETUP SESSION
# ============================
session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36",
    # PENTING: text/plain supaya Apps Script tak block sebab CORS
    "Content-Type": "text/plain;charset=utf-8",
})

print(f"🚀 Hantar {len(data_list)} rekod ke Google Apps Script\n")

berjaya = 0
gagal = 0

for i, o in enumerate(data_list, 1):
    try:
        # Apps Script kena hantar sebagai JSON string, bukan form-data
        res = session.post(
            SCRIPT_URL,
            data=json.dumps(o),
            timeout=25,
            allow_redirects=True,
        )

        # Apps Script redirect 302 dulu, then 200 dengan JSON
        try:
            result = res.json()
            status = result.get("status")
            if status == "ok":
                print(f"{i:2}. {o['nama']:38} → ✅")
                berjaya += 1
            else:
                print(f"{i:2}. {o['nama']:38} → ⚠️ {result}")
                gagal += 1
        except Exception:
            # Mungkin respon bukan JSON (redirect chain problem)
            print(f"{i:2}. {o['nama']:38} → ⚠️ HTTP {res.status_code}")
            gagal += 1

    except Exception as e:
        print(f"{i:2}. {o['nama']:38} → ❌ {e}")
        gagal += 1

    time.sleep(1.0)  # jangan spam, Apps Script ada quota

print(f"\n📊 Selesai: {berjaya} ✅  |  {gagal} ❌")
print(f"🔗 Semak Google Sheet kau untuk confirm data masuk.")
