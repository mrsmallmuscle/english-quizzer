-- Fix: cho phép correct = null (dành cho dạng matching)
alter table questions alter column correct drop not null;
