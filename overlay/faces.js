/*
 * Bộ sưu tập mặt ma cho jumpscare và ma ló mặt.
 * Mỗi mặt là SVG tĩnh (không chứa dữ liệu người xem) => an toàn để gán innerHTML.
 */
(() => {
  'use strict';

  const warp = (id, scale = 14, freq = '0.018 0.03') => `
    <filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="7" result="n">
        <animate attributeName="seed" values="7;19;3;27;11" dur="0.4s" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="${scale}"/>
    </filter>`;

  const FACES = [
    {
      key: 'manu',
      title: 'MA NỮ ĐÃ TỚI…',
      svg: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg"><defs>${warp('w1')}
        <radialGradient id="m1s" cx="50%" cy="42%" r="58%"><stop offset="0" stop-color="#e8e4da"/><stop offset=".55" stop-color="#b9b4a8"/><stop offset=".85" stop-color="#6b675e"/><stop offset="1" stop-color="#2a2824"/></radialGradient>
        <radialGradient id="m1e" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000"/><stop offset=".7" stop-color="#050303"/><stop offset="1" stop-color="#3a2a26" stop-opacity="0"/></radialGradient>
        <radialGradient id="m1m" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#000"/><stop offset=".75" stop-color="#140202"/><stop offset="1" stop-color="#4a0c0c"/></radialGradient></defs>
        <g filter="url(#w1)">
          <path d="M40 520C10 380 20 150 90 70 150 0 260 0 320 70 390 150 395 380 360 520z" fill="#050404"/>
          <path d="M200 70C125 70 95 150 98 235 100 330 135 430 200 470 265 430 300 330 302 235 305 150 275 70 200 70z" fill="url(#m1s)"/>
          <ellipse cx="128" cy="300" rx="22" ry="60" fill="#3d3a33" opacity=".45"/><ellipse cx="272" cy="300" rx="22" ry="60" fill="#3d3a33" opacity=".45"/>
          <ellipse cx="152" cy="222" rx="44" ry="50" fill="url(#m1e)" transform="rotate(-8 152 222)"/>
          <ellipse cx="250" cy="226" rx="40" ry="54" fill="url(#m1e)" transform="rotate(10 250 226)"/>
          <circle cx="158" cy="228" r="4.5" fill="#f8fafc"/><circle cx="244" cy="232" r="3.5" fill="#f8fafc"/>
          <path d="M140 262c-3 30 4 58-2 96 6-36 10-62 8-96z" fill="#6b0000"/><path d="M258 270c4 28-2 50 4 84-8-30-10-56-8-84z" fill="#6b0000"/>
          <path d="M168 328C178 316 222 316 232 328 246 380 236 452 200 462 164 452 154 380 168 328z" fill="url(#m1m)"/>
          <path d="M172 334l6 10 6-9 6 10 6-10 6 10 6-10 6 9 6-10" stroke="#9c958a" stroke-width="3" fill="none" stroke-linejoin="round"/>
          <path d="M200 64C150 64 112 96 100 150 96 210 104 300 92 420 112 300 120 220 138 160 150 128 170 112 196 108z" fill="#070606"/>
          <path d="M200 64C252 64 292 100 300 160 306 230 296 320 312 440 286 320 282 230 262 168 250 130 228 112 204 108z" fill="#070606"/>
          <path d="M186 104c-8 60-26 120-36 230M214 104c10 70 22 130 38 236M196 104c-2 50-6 90-14 140" stroke="#000" stroke-width="5" fill="none" opacity=".85"/>
        </g></svg>`
    },
    {
      key: 'skull',
      title: 'ĐẦU LÂU ĐÒI MẠNG!',
      svg: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg"><defs>${warp('w2', 10)}
        <radialGradient id="s2b" cx="50%" cy="35%" r="65%"><stop offset="0" stop-color="#f5f0e1"/><stop offset=".6" stop-color="#c9bfa5"/><stop offset="1" stop-color="#4a4334"/></radialGradient>
        <radialGradient id="s2e" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ff2a2a"/><stop offset=".18" stop-color="#7a0000"/><stop offset=".45" stop-color="#000"/></radialGradient></defs>
        <g filter="url(#w2)">
          <path d="M200 40C100 40 50 120 55 210c3 60 30 100 60 120l5 60c0 20 20 30 40 30h80c20 0 40-10 40-30l5-60c30-20 57-60 60-120C350 120 300 40 200 40z" fill="url(#s2b)"/>
          <path d="M80 190c10-40 50-60 95-45 10 40-10 85-55 90-30 2-45-20-40-45z" fill="url(#s2e)"/>
          <path d="M320 190c-10-40-50-60-95-45-10 40 10 85 55 90 30 2 45-20 40-45z" fill="url(#s2e)"/>
          <path d="M200 250l-22 50h44z" fill="#0a0806"/>
          <path d="M125 340h150v62H125z" fill="#0a0806"/>
          <path d="M140 340v26M160 340v34M180 340v34M200 340v34M220 340v34M240 340v34M260 340v26M140 402v-24M160 402v-28M180 402v-30M200 402v-30M220 402v-30M240 402v-28M260 402v-24" stroke="#e7dfcb" stroke-width="12" stroke-linecap="round"/>
          <path d="M200 44l-8 40 14 22-12 36M300 110l-30 18 4 26M95 120l26 22" stroke="#3b3326" stroke-width="3" fill="none"/>
        </g></svg>`
    },
    {
      key: 'demon',
      title: 'QUỶ DỮ THỨC GIẤC!',
      svg: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg"><defs>${warp('w3', 12)}
        <radialGradient id="d3s" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#b91c1c"/><stop offset=".6" stop-color="#5f0a0a"/><stop offset="1" stop-color="#140202"/></radialGradient>
        <radialGradient id="d3e" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff7ae"/><stop offset=".4" stop-color="#facc15"/><stop offset="1" stop-color="#7c2d12"/></radialGradient></defs>
        <g filter="url(#w3)">
          <path d="M110 120C80 60 70 20 40 0c30 60 30 110 50 160zM290 120c30-60 40-100 70-120-30 60-30 110-50 160z" fill="#1c0a05"/>
          <path d="M200 80C110 80 70 160 75 250c5 100 60 190 125 210 65-20 120-110 125-210 5-90-35-170-125-170z" fill="url(#d3s)"/>
          <path d="M95 200l100 30-100 20zM305 200l-100 30 100 20z" fill="#140202"/>
          <path d="M110 214c20-6 50 0 70 16-25 12-55 10-70-16zM290 214c-20-6-50 0-70 16 25 12 55 10 70-16z" fill="url(#d3e)"/>
          <path d="M146 218h6v14h-6zM248 218h6v14h-6z" fill="#000"/>
          <path d="M100 330c40 50 160 50 200 0-10 70-50 100-100 100s-90-30-100-100z" fill="#0a0000"/>
          <path d="M108 334l12 30 12-26 14 34 14-30 14 36 14-34 12 36 12-36 14 34 14-30 14 30 12-26 12 26" fill="#f5f5f4" stroke="#f5f5f4" stroke-width="2" stroke-linejoin="round"/>
          <path d="M150 400l10-24 12 26 14-28 14 30 14-28 14 26 10-24" fill="#e7e5e4"/>
        </g></svg>`
    },
    {
      key: 'doll',
      title: 'BÚP BÊ MUỐN CHƠI VỚI BẠN…',
      svg: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg"><defs>${warp('w4', 8)}
        <radialGradient id="b4s" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="#fffaf3"/><stop offset=".7" stop-color="#e9d8c8"/><stop offset="1" stop-color="#8a7465"/></radialGradient>
        <radialGradient id="b4e" cx="45%" cy="45%" r="55%"><stop offset="0" stop-color="#e0f2fe"/><stop offset=".3" stop-color="#38bdf8"/><stop offset=".55" stop-color="#0c4a6e"/><stop offset=".6" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient></defs>
        <g filter="url(#w4)">
          <path d="M40 300C30 140 100 50 200 50s170 90 160 250c-20-60-40-80-60-90 10-40 0-80-30-100-60 20-150 20-210 0-30 20-40 60-30 100-20 10-40 30-60 90z" fill="#2b1608"/>
          <ellipse cx="200" cy="270" rx="140" ry="170" fill="url(#b4s)"/>
          <path d="M70 180c40-50 220-50 260 0-30-30-70-40-130-40s-100 10-130 40z" fill="#2b1608"/>
          <circle cx="145" cy="250" r="44" fill="url(#b4e)" stroke="#3f2a1d" stroke-width="5"/>
          <circle cx="145" cy="250" r="8" fill="#fff" opacity=".9"/>
          <ellipse cx="258" cy="252" rx="40" ry="44" fill="#000"/>
          <path d="M226 230l-30-40M300 236l20-46M236 300l-24 40 12 40" stroke="#5b4636" stroke-width="3" fill="none"/>
          <ellipse cx="110" cy="320" rx="30" ry="16" fill="#f472b6" opacity=".45"/><ellipse cx="290" cy="320" rx="30" ry="16" fill="#f472b6" opacity=".45"/>
          <path d="M140 360q60 40 120 0" stroke="#7f1d1d" stroke-width="6" fill="none"/>
          <path d="M150 352v18M170 360v18M190 364v18M210 364v18M230 360v18M250 352v18" stroke="#1c1917" stroke-width="3"/>
          <path d="M258 296c4 40-6 80 2 130" stroke="#111" stroke-width="5" fill="none" opacity=".8"/>
        </g></svg>`
    },
    {
      key: 'jiangshi',
      title: 'CƯƠNG THI NHẢY TỚI!',
      svg: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg"><defs>${warp('w5', 9)}
        <radialGradient id="j5s" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#c7d6c0"/><stop offset=".65" stop-color="#7f9479"/><stop offset="1" stop-color="#2c3a2a"/></radialGradient></defs>
        <g filter="url(#w5)">
          <path d="M90 130h220l20-50H70z" fill="#0b0b0f"/><path d="M120 80h160l-10-40H130z" fill="#111118"/><circle cx="200" cy="48" r="12" fill="#b91c1c"/>
          <path d="M200 120C120 120 95 190 98 270c3 90 40 170 102 190 62-20 99-100 102-190 3-80-22-150-102-150z" fill="url(#j5s)"/>
          <path d="M140 240c14-14 36-14 50 0-14 12-36 12-50 0zM210 240c14-14 36-14 50 0-14 12-36 12-50 0z" fill="#f8fafc"/>
          <circle cx="165" cy="241" r="3" fill="#000"/><circle cx="235" cy="241" r="3" fill="#000"/>
          <path d="M150 360q50 30 100 0" stroke="#1f1a17" stroke-width="7" fill="none"/>
          <path d="M162 366l8 26 8-22M222 366l8 22 8-26" fill="#f5f5f4"/>
          <g transform="rotate(-4 200 260)">
            <rect x="168" y="120" width="64" height="230" fill="#facc15"/>
            <path d="M200 140v22M186 150h28M190 176c20 10 0 20 20 30s-20 20 0 30M184 250h32M200 262v40M188 286l24 10M186 320c10 10 18 10 28 0" stroke="#b91c1c" stroke-width="6" fill="none" stroke-linecap="round"/>
          </g>
        </g></svg>`
    },
    {
      key: 'stretch',
      title: 'NÓ ĐANG NHÌN BẠN…',
      svg: `<svg viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg"><defs>${warp('w6', 20, '0.01 0.05')}
        <linearGradient id="t6s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4d4d8"/><stop offset=".6" stop-color="#a1a1aa"/><stop offset="1" stop-color="#3f3f46"/></linearGradient></defs>
        <g filter="url(#w6)">
          <path d="M200 20C130 20 110 90 112 170c2 120 20 260 88 340 68-80 86-220 88-340 2-80-18-150-88-150z" fill="url(#t6s)"/>
          <ellipse cx="165" cy="150" rx="22" ry="34" fill="#fafafa"/><ellipse cx="235" cy="150" rx="22" ry="34" fill="#fafafa"/>
          <ellipse cx="165" cy="150" rx="22" ry="34" fill="none" stroke="#18181b" stroke-width="3"/><ellipse cx="235" cy="150" rx="22" ry="34" fill="none" stroke="#18181b" stroke-width="3"/>
          <path d="M175 210c10 10 40 10 50 0" stroke="#3f3f46" stroke-width="3" fill="none"/>
          <path d="M168 250c10-8 54-8 64 0 16 80 6 180-32 230-38-50-48-150-32-230z" fill="#000"/>
          <path d="M150 120c10-16 30-22 40-18M250 120c-10-16-30-22-40-18" stroke="#27272a" stroke-width="4" fill="none"/>
        </g></svg>`
    }
  ];

  let lastKey = '';
  function pickFace() {
    const pool = FACES.filter((f) => f.key !== lastKey);
    const f = pool[Math.floor(Math.random() * pool.length)];
    lastKey = f.key;
    return f;
  }

  window.ScareFaces = { list: FACES, pick: pickFace };
})();
