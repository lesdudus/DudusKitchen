-- Additive column: the app's existing "hide from default browsing" toggle is
-- independent of like/dislike status, so it needs its own column rather than
-- overloading the reaction enum (a liked recipe can still be hidden).
alter table recipe_status add column hidden boolean not null default false;
