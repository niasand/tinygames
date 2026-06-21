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

## [2026-06-21] PL/pgSQL function 三连环坑（42702 / 42804 / 42P13）

### 现象
排行榜 RPC `get_seed_leaderboard` 远程调用连续报三个错，逐一修：
1. `42702 column "time_seconds" is ambiguous` —— 函数 OUT 参数名 `time_seconds` 与表列同名。
2. `42804 Returned type bigint does not match expected type integer` —— `row_number()` 返回 bigint，但 `rank` 声明成 int。
3. `42P13 cannot change return type of existing function` —— `create or replace` 不能改返回类型。

### 根因
没在本地跑通 RPC 就让用户在 SQL Editor 执行，光读 SQL 看不出 PG 的类型/歧义/返回类型限制——全是运行时才暴露。

### 修复
- 子查询列加表别名限定（`gr.*`）消除 42702。
- `returns table` 里 `rank` 声明 `bigint`（对齐 `row_number()`）消除 42804。
- 先 `drop function if exists public.get_seed_leaderboard(text, int)` 再 `create` 消除 42P13。

### 涉及文件
- supabase/schema.sql
- supabase/fix_rpc.sql

### 验证证据
远程 `curl .../rpc/get_seed_leaderboard -d '{"p_seed":"test12","p_limit":10}'` → `[]` HTTP 200（修复前依次是 42702 / 42804 / 42P13）。

### 教训（通用铁律）
- **PL/pgSQL function 的 DDL 必须先本地验证再交付**：用 supabase local docker 或 psql 跑通（auth.uid() 可临时 mock），不要光读 SQL 就让用户执行。OUT 参数歧义、聚合函数返回类型、create-or-replace 不能改返回类型，全是运行时才暴露。
- OUT 参数名不要与查询的表列同名（否则函数体内裸列名歧义）；若同名，子查询列必须用表别名限定（`alias.col`）。
- `row_number()` / `count()` 等窗口与聚合函数返回 `bigint`，对应 OUT 参数声明 `bigint`。
- 改函数返回类型不能 `create or replace`，要先 `drop function name(arg_types)`（带参数签名避免误删重载）。
