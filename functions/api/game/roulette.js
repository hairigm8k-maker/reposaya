import { getCookie, verifySession, json } from '../../_utils.js';

async function initTable(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS roulette_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT UNIQUE NOT NULL COLLATE NOCASE,
      balance INTEGER DEFAULT 100,
      total_spins INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

// GET: Check player status (by session or by name query)
export async function onRequestGet({ request, env }) {
  try {
    await initTable(env);

    const token = getCookie(request, 'hh_session');
    const session = await verifySession(env, token);

    const url = new URL(request.url);
    const queryName = (url.searchParams.get('name') || '').trim();

    let player = null;

    if (session && session.userId) {
      player = await env.DB.prepare(
        'SELECT id, user_id, name, balance, total_spins FROM roulette_players WHERE user_id = ?'
      ).bind(session.userId).first();

      if (!player) {
        // Create player for logged in user with RM100 starting balance
        const displayName = session.name || session.email.split('@')[0];
        try {
          await env.DB.prepare(
            'INSERT INTO roulette_players (user_id, name, balance) VALUES (?, ?, 100)'
          ).bind(session.userId, displayName).run();

          player = await env.DB.prepare(
            'SELECT id, user_id, name, balance, total_spins FROM roulette_players WHERE user_id = ?'
          ).bind(session.userId).first();
        } catch (e) {
          // If name conflict, try with unique suffix
          const altName = displayName + '_' + session.userId;
          await env.DB.prepare(
            'INSERT INTO roulette_players (user_id, name, balance) VALUES (?, ?, 100)'
          ).bind(session.userId, altName).run();

          player = await env.DB.prepare(
            'SELECT id, user_id, name, balance, total_spins FROM roulette_players WHERE user_id = ?'
          ).bind(session.userId).first();
        }
      }
    } else if (queryName) {
      player = await env.DB.prepare(
        'SELECT id, user_id, name, balance, total_spins FROM roulette_players WHERE name = ?'
      ).bind(queryName).first();
    }

    if (!player) {
      return json({ ok: true, authenticated: false, player: null });
    }

    return json({
      ok: true,
      authenticated: true,
      player: {
        id: player.id,
        name: player.name,
        balance: player.balance,
        total_spins: player.total_spins
      }
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

// POST: Join or create player profile with RM100
export async function onRequestPost({ request, env }) {
  try {
    await initTable(env);

    const body = await request.json();
    const rawName = (body.name || '').trim();

    if (!rawName) {
      return json({ ok: false, error: 'Sila masukkan nama anda' }, 400);
    }

    if (rawName.length < 2 || rawName.length > 30) {
      return json({ ok: false, error: 'Nama mesti antara 2 hingga 30 huruf' }, 400);
    }

    const token = getCookie(request, 'hh_session');
    const session = await verifySession(env, token);
    const userId = session ? session.userId : null;

    // Check if player already exists
    let player = await env.DB.prepare(
      'SELECT id, user_id, name, balance, total_spins FROM roulette_players WHERE name = ?'
    ).bind(rawName).first();

    if (!player) {
      // New account gets RM100 free starting chips
      await env.DB.prepare(
        'INSERT INTO roulette_players (user_id, name, balance) VALUES (?, ?, 100)'
      ).bind(userId, rawName).run();

      player = await env.DB.prepare(
        'SELECT id, user_id, name, balance, total_spins FROM roulette_players WHERE name = ?'
      ).bind(rawName).first();
    } else if (userId && !player.user_id) {
      // Link to account if not linked
      await env.DB.prepare(
        'UPDATE roulette_players SET user_id = ? WHERE id = ?'
      ).bind(userId, player.id).run();
    }

    return json({
      ok: true,
      player: {
        id: player.id,
        name: player.name,
        balance: player.balance,
        total_spins: player.total_spins
      }
    });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}

// PATCH: Update player balance after each game spin
export async function onRequestPatch({ request, env }) {
  try {
    await initTable(env);

    const body = await request.json();
    const playerId = parseInt(body.id);
    const newBalance = parseInt(body.balance);

    if (!playerId || isNaN(newBalance)) {
      return json({ ok: false, error: 'Data tidak sah' }, 400);
    }

    await env.DB.prepare(
      'UPDATE roulette_players SET balance = ?, total_spins = total_spins + 1, updated_at = datetime(\'now\') WHERE id = ?'
    ).bind(newBalance, playerId).run();

    return json({ ok: true, balance: newBalance });
  } catch (err) {
    return json({ ok: false, error: err.message }, 500);
  }
}
