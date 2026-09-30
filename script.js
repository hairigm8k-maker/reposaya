document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('myBtn');
    const greeting = document.getElementById('greeting');
    let count = 0;

    button.addEventListener('click', () => {
        count++;
        greeting.textContent = `Terima kasih kerana klik! (Kali ke-${count})`;
        greeting.style.color = '#38bdf8';
        
        const colors = ['#1e1b4b', '#172554', '#0f172a', '#2e1065'];
        document.body.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    });
    
    console.log('Script.js berjaya dimuatkan!');
});
