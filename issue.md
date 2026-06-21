# issue.md — 项目踩坑记录

## [2026-06-21] Supabase query builder 返回 PromiseLike，.finally() 类型报错

### 现象
`useLeaderboard.ts` / `useMyRecords.ts` 中 `supabase.rpc(...).then(cb).finally(...)` 触发：
```
error TS2339: Property 'finally' does not exist on type 'PromiseLike<void>'.
```

### 根因
supabase-js 的 query builder（`from().select().eq()...`、`rpc()`）返回的是 **`PromiseLike`**（thenable），不是完整 `Promise`。`PromiseLike` 只有 `.then`，没有 `.catch` / `.finally`。当 `.then(cb)` 的回调不返回值时，链式结果类型仍是 `PromiseLike<void>`，所以 `.finally` 在类型层不可用。

### 修复方案
把 `.then().finally()` 链改成 `async/await` + `try/finally`：
```ts
void (async () => {
  try {
    const { data, error } = await supabase.rpc(...)   // await 解包 PromiseLike
    if (!error) setRows(data ?? [])
  } finally {
    setLoading(false)
  }
})()
```

### 涉及文件
- src/hooks/useLeaderboard.ts
- src/hooks/useMyRecords.ts

### 验证证据
`npx tsc -b` → No errors found；`npm run test` → 4 passed。

### 教训（通用铁律）
- **supabase-js 的所有查询返回 `PromiseLike`**，链式调用只能用 `.then`。需要 `.finally` / `.catch` 或更自然的控制流时，一律用 `async/await` 解包（IIFE 或 async 函数），**不要在 thenable 上链 `.finally`**。
- 适用面：任何基于 `PromiseLike`/thenable 设计的 SDK（不只 supabase）都有此陷阱。
[AI-REVIEW] Large commit detected: 2053 lines added. Consider reviewing for AI Psychosis.
[AI-REVIEW] Large commit detected: 466 lines added. Consider reviewing for AI Psychosis.
