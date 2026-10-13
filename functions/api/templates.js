import { json } from '../_utils.js';

export async function onRequestGet({}) {
  return json({
    ok: true,
    templates: [
      { id: 'blank', name: 'Blank', desc: 'Empty HTML page' },
      { id: 'bio', name: 'Link in Bio', desc: 'Personal links page' },
      { id: 'product', name: 'Product Landing', desc: 'Sell one product' },
      { id: 'portfolio', name: 'Portfolio', desc: 'Showcase your work' },
      { id: 'feedback', name: 'Form Feedback', desc: 'Collect responses' }
    ]
  });
}
