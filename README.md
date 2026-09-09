# 캔슬캣 (Cancel Cat)

나가기 귀찮을 때, 서로 눈치 보지 않고 마음을 확인해 약속을 무산시킬 수 있는 장난스러운 **약속 취소 전용** 웹 서비스입니다.

슈뢰딩거의 고양이처럼, **모두가 가기 싫다는 의사를 표했을 때만** 약속 파기가 공개됩니다. 한 명이라도 버튼을 누르지 않으면 투표 여부 자체가 절대 드러나지 않고, 약속은 그냥 진행됩니다.

## 작동 방식

1. 방장이 로그인 없이 약속 이름과 인원수(2명 이상)를 넣고 방을 만듭니다.
2. 전용 링크를 카카오톡, 토스 메시지 등으로 공유합니다.
3. 모임원들은 가운데 **[가기 싫음]** 버튼을 누릅니다.
4. 서버에는 *누가* 눌렀는지 저장되지 않습니다. 익명 토큰의 해시만 중복 방지용으로 남습니다.
5. **성공:** 마지막 한 명이 누르는 순간 모든 화면이 같은 파기 확정 연출로 바뀝니다.
6. **유지:** 한 명이라도 안 누르면 아무 일도 일어나지 않습니다.

공개 API는 취소되기 전까지 투표 수를 내려주지 않습니다.

## 개발

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인합니다.

```bash
pnpm test
pnpm lint
pnpm build
```

로컬에서는 `.data/rooms.json` 파일에 방이 저장됩니다. Vercel에 올릴 때는 인스턴스가 여러 개일 수 있으므로 Upstash Redis / Vercel KV를 연결하세요.

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

또는

```
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

카카오톡 링크 미리보기를 위해 배포 URL을 넣으면 좋습니다.

```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```
