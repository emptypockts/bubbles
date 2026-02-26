export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 }
  ]
};

const BASE_URL = "https://bubbles.eacsa.us";

export default function () {

  const res = http.get(BASE_URL);

  check(res, {
    "homepage status 200": (r) => r.status === 200,
    "homepage loads fast": (r) => r.timings.duration < 2000
  });

  sleep(1);
}
