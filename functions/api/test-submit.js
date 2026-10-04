export async function onRequestPost({ request }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const data = await request.json();
    const { nama, ic, alamat, telefon, email } = data;

    // Validate
    if (!nama || !ic || !alamat || !telefon || !email) {
      return new Response(JSON.stringify({
        ok: false, error: 'Sila isi semua ruangan'
      }), { status: 400, headers: corsHeaders });
    }

    // Simple IC format check
    if (!/^\d{6}-\d{2}-\d{4}$/.test(ic)) {
      return new Response(JSON.stringify({
        ok: false, error: 'Format IC salah. Guna: 990101-01-1234'
      }), { status: 400, headers: corsHeaders });
    }

    // Simple email check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({
        ok: false, error: 'Email tidak sah'
      }), { status: 400, headers: corsHeaders });
    }

    // Process — for now just add metadata + timestamp
    const processed = {
      nama: nama.trim(),
      ic: ic.trim(),
      alamat: alamat.trim(),
      telefon: telefon.trim(),
      email: email.trim(),
      submittedAt: new Date().toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' }),
      refId: 'TEST-' + Date.now().toString(36).toUpperCase()
    };

    console.log('Form submitted:', processed);

    return new Response(JSON.stringify({
      ok: true,
      message: 'Berjaya diterima',
      data: processed
    }), { headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({
      ok: false, error: err.message
    }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
