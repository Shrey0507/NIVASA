-- NIVASA additive migration. Review against the live schema before applying.
-- This migration intentionally does not create, drop, or reset application tables.

create or replace function public.allocate_room(p_student_id uuid, p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare r rooms%rowtype; a room_allocations%rowtype; active_count integer;
begin
  select * into r from rooms where id = p_room_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'Room not found'; end if;
  if exists (select 1 from room_allocations where student_id = p_student_id and vacated_at is null) then raise exception using errcode = 'P0001', message = 'Student already has an active allocation'; end if;
  select count(*) into active_count from room_allocations where room_id = p_room_id and vacated_at is null;
  if active_count >= r.capacity then raise exception using errcode = 'P0001', message = 'Room is at capacity'; end if;
  insert into room_allocations(student_id, room_id, allocated_at) values (p_student_id, p_room_id, now()) returning * into a;
  return to_jsonb(a);
end;
$$;

create or replace function public.vacate_room(p_allocation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare a room_allocations%rowtype;
begin
  update room_allocations set vacated_at = now() where id = p_allocation_id and vacated_at is null returning * into a;
  if not found then raise exception using errcode = 'P0002', message = 'Active allocation not found'; end if;
  return to_jsonb(a);
end;
$$;
