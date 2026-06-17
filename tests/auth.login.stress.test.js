import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration
const BASE_URL = 'https://bubbles.eacsa.us'; // Change to your domain
const TEST_USER = {
    userName: 'dada', // Change to your test username
    password: 'dada1234' // Change to your test password
};

export const options = {
    stages: [
        { duration: '30s', target: 10 },    // Ramp up to 10 users
        { duration: '1m30s', target: 50 },  // Ramp up to 50 users
        { duration: '2m', target: 100 },    // Ramp up to 100 users
        { duration: '1m', target: 50 },     // Ramp down to 50 users
        { duration: '30s', target: 0 },     // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
        http_req_failed: ['rate<0.1'], // Error rate below 10%
    },
};

export default function () {
    const payload = JSON.stringify({
        userName: TEST_USER.userName,
        password: TEST_USER.password,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = http.post(`${BASE_URL}/api/login_user`, payload, params);

    check(response, {
        'status is 200': (r) => r.status === 200,
        'has token': (r) => r.body.includes('token'),
        'has avatar': (r) => r.body.includes('avatar'),
        'response time < 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}

