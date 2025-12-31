-- Inserir estrutura principal PEOTRAM 2024
INSERT INTO public.peotram_structures (year, cycle, total_elements, total_items)
VALUES (2024, 'Ciclo 2024', 13, 195)
ON CONFLICT (year, cycle) DO NOTHING;