create or replace function public.record_fortune_draw(
  p_source_key text,
  p_fortune_id smallint,
  p_snapshot jsonb
)
returns public.fortune_draws
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  current_draw_date date := (timezone('Asia/Shanghai', now()))::date;
  saved_draw public.fortune_draws;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  if p_fortune_id < 1 or p_fortune_id > 64 then
    raise exception 'invalid_fortune_id';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(current_user_id::text || ':' || current_draw_date::text, 0)
  );

  if (
    select count(*)
    from public.fortune_draws
    where user_id = current_user_id
      and drawn_on = current_draw_date
  ) >= 3 then
    raise exception 'daily_limit_reached';
  end if;

  insert into public.fortune_draws (
    user_id,
    source_key,
    fortune_id,
    drawn_on,
    snapshot
  ) values (
    current_user_id,
    p_source_key,
    p_fortune_id,
    current_draw_date,
    p_snapshot
  )
  returning * into saved_draw;

  return saved_draw;
end;
$$;

revoke all on function public.record_fortune_draw(text, smallint, jsonb) from public;
revoke all on function public.record_fortune_draw(text, smallint, jsonb) from anon;
grant execute on function public.record_fortune_draw(text, smallint, jsonb) to authenticated;
