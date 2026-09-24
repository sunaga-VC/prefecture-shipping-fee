-- 都道府県移動料金システム: Supabase スキーマ定義
-- Supabaseダッシュボード → SQL Editor に貼り付けて実行してください。

-- 料金マスタ(4地域 × 4地域 = 16行固定。行の追加・削除は行わない)
create table public.shipping_fees (
  departure_region text not null
    check (departure_region in ('北海道','本州','九州','沖縄')),
  arrival_region text not null
    check (arrival_region in ('北海道','本州','九州','沖縄')),
  fee integer,
  updated_at timestamptz not null default now(),
  primary key (departure_region, arrival_region)
);

-- 変更履歴(追記のみ・更新/削除は行わない)
create table public.fee_change_history (
  id uuid primary key default gen_random_uuid(),
  departure_region text not null,
  arrival_region text not null,
  previous_fee integer,
  next_fee integer,
  changed_at timestamptz not null default now(),
  changed_by_email text not null default (auth.jwt() ->> 'email')
);

-- 初期データ(現行 INITIAL_FEE_MATRIX と同一の値)
insert into public.shipping_fees (departure_region, arrival_region, fee) values
  ('北海道','北海道',5000), ('北海道','本州',6000), ('北海道','九州',7000), ('北海道','沖縄',null),
  ('本州','北海道',6000),   ('本州','本州',5000),   ('本州','九州',6000),   ('本州','沖縄',7000),
  ('九州','北海道',7000),   ('九州','本州',6000),   ('九州','九州',5000),   ('九州','沖縄',7000),
  ('沖縄','北海道',null),   ('沖縄','本州',7000),   ('沖縄','九州',7000),   ('沖縄','沖縄',null);

-- RLS(Row Level Security)
alter table public.shipping_fees enable row level security;
alter table public.fee_change_history enable row level security;

-- 料金マスタ: 閲覧は誰でも可(運賃判定画面で必要)
create policy "shipping_fees_select_all"
  on public.shipping_fees for select
  to anon, authenticated
  using (true);

-- 料金マスタ: 更新はログインユーザーのみ(行の追加・削除は不可のまま)
create policy "shipping_fees_update_authenticated"
  on public.shipping_fees for update
  to authenticated
  using (true)
  with check (true);

-- 変更履歴: 閲覧は誰でも可
create policy "fee_change_history_select_all"
  on public.fee_change_history for select
  to anon, authenticated
  using (true);

-- 変更履歴: 追加(insert)はログインユーザーのみ。更新・削除ポリシーは作らない(=常に拒否・改ざん不可)
create policy "fee_change_history_insert_authenticated"
  on public.fee_change_history for insert
  to authenticated
  with check (true);
