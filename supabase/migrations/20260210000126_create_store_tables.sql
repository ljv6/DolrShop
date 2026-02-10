create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price numeric not null
);
