-- Populate the Categorías catalog with the real modeling/staffing roles used across
-- the registration form, model edit form, and public catalog. These previously only
-- existed under the separate (now UI-retired) Actividades catalog.
DO $$
DECLARE
  seed RECORD;
BEGIN
  FOR seed IN
    SELECT * FROM (VALUES
      ('33d234fb-fa1c-41ae-93e4-0d647c4d2cef', 'Actor'),
      ('b71bc340-40c3-492c-a971-414eec2a6aa9', 'Actriz'),
      ('a430de5f-c5a0-4ea6-aa3d-7e6704220885', 'Animación por micrófono'),
      ('a31ff9ff-e72f-430d-a967-b22f54e8be76', 'Conducción de eventos'),
      ('09b176e2-a4be-4944-96e6-893540861dc7', 'Coordinación'),
      ('717dd618-547d-466f-b233-4af1dcf51a73', 'Demostradora'),
      ('f230a699-023f-4235-9275-c2dc9820de59', 'Edecanía COL'),
      ('8f3c874a-6ee3-4c07-bd58-8c920f4e410a', 'Extra/figurante'),
      ('57e3ca65-4712-468b-95df-16a8bcdc273d', 'Fotografía'),
      ('be39ed0a-655f-4719-ae02-a8ee94cdfb15', 'G.O.'),
      ('6c2eec47-4540-40cc-b06a-39e0f4dffea0', 'G.O/Promotor Perfumería'),
      ('b79f7fc0-cbb4-4a77-b0ce-e24a7291f0e1', 'Maestro de ceremonias'),
      ('9f485d26-59cd-43c9-835d-b5686c6368d0', 'Modelo de protocolo MX'),
      ('f954a2ad-91af-4eed-a7b9-03eea532eebc', 'Modelo para comerciales'),
      ('d4a7dea9-7c4b-4d2f-8d39-1a3b514697f0', 'Modelo para fotografía'),
      ('ef7e5bef-c88b-45be-a340-00dd8831a887', 'Modelo para videos musicales'),
      ('8db6efd6-2f62-4dfc-b223-d83161ee7da0', 'Personal para limpieza'),
      ('bd14ea59-9e65-42cd-b46f-0fb586ff1728', 'Personal para seguridad'),
      ('719c9f69-d057-47d5-9da4-13d4127ef39b', 'Promotoria COL'),
      ('93ce9424-f657-4d9b-9eef-1e1dc5aecccf', 'Promotoria MX'),
      ('7e50a901-2601-4498-a4d8-dbaf04847c45', 'Staff eventos'),
      ('50783544-316d-4559-80ee-e0c379fb1489', 'Supervisión'),
      ('00285124-a7ea-45d3-b1dd-090cdf9e749e', 'Volantero')
    ) AS s(id, name)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = seed.name) THEN
      INSERT INTO categories (id, name, enabled) VALUES (seed.id, seed.name, true);
    END IF;
  END LOOP;
END $$;
