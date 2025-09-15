import fetch from 'node-fetch';

const URL = 'http://localhost:3000/api/fake-user-check';
const ITER = 20;

async function run() {
    let trueTrue = 0;
    let falseFalse = 0;
    let other = 0;
    const samples = [];

    for (let i = 0; i < ITER; i++) {
        const body = { nationalId: `123456789${i}`, mobile: '09123456789', random: true };
        try {
            const res = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const json = await res.json();
            samples.push(json);

            if (json?.success && json?.data) {
                const v = json.data.verified;
                const h = json.data.hasBankAccount;
                if (v === true && h === true) trueTrue++;
                else if (v === false && h === false) falseFalse++;
                else other++;
            } else {
                other++;
            }
        } catch (err) {
            console.error('request failed', err);
            other++;
        }
    }

    console.log({ ITER, trueTrue, falseFalse, other });
    console.log('samples:', samples.slice(0, 5));
}

run().catch(e => console.error(e));
