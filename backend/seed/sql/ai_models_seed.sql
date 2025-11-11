-- Auto-generated seed helper for normalized POI tables
BEGIN;
TRUNCATE TABLE agent_run_evidence, agent_runs, chat_messages, chat_sessions, agent_memories, itinerary_items, itineraries, poi_categories, poi_tags, opening_hours, reviews, feedbacks, categories, tags, pois RESTART IDENTITY CASCADE;

-- Categories
INSERT INTO categories (id, slug, display_name) VALUES
  ('c2e5465b-3717-52bd-8d0a-93347109e98b', 'landmark', 'Landmark'),
  ('3d80911f-5fe0-58be-94b5-29d2666bcddf', 'viewpoint', 'Viewpoint'),
  ('8e0e60bd-fdd7-56a7-94be-0ae1401113a4', 'museum', 'Museum'),
  ('445675f3-624e-5d0b-9fde-3b93380652d1', 'nature', 'Nature'),
  ('7e91b05a-e641-560d-93dd-d7c85deb1ada', 'temple', 'Temple'),
  ('d4e1f2d6-14aa-5398-b53d-3a82138a01fb', 'beach', 'Beach'),
  ('ca98f2a6-d0c1-5017-9394-4c3e314fcee3', 'market', 'Market'),
  ('d2406580-7551-53c7-bc3f-ec1f01a6387f', 'park', 'Park'),
  ('49a8a481-433f-590c-8e9e-e069bb9b25b6', 'mall', 'Mall'),
  ('e5f483d3-f7d6-5fb4-8929-da7764d5ef9a', 'food-drinks', 'Food & Drinks')
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, display_name = EXCLUDED.display_name;

-- Tags
INSERT INTO tags (id, slug, display_name) VALUES
  ('5146ee2c-7536-5a50-8d15-7dba76c5ad3c', 'colaba', 'colaba'),
  ('cd8a08c3-5bed-5fdd-8b9d-8b69b4515c7f', 'landmark', 'landmark'),
  ('4f8fec87-46e1-5c56-bc02-42f998d8477b', 'marine-drive', 'marine drive'),
  ('64663442-029d-5775-93c2-830bfd91b73a', 'viewpoint', 'viewpoint'),
  ('e69c02dc-673c-5978-9243-a850dd93f6f4', 'outdoors', 'outdoors'),
  ('34765eb5-b1ed-5308-8454-ba956af3dda8', 'fort', 'fort'),
  ('771eb94b-6bf8-5649-b5ce-a1d3fabe6cca', 'museum', 'museum'),
  ('42b439c5-5fdd-5f88-a10d-d1ee84a57a12', 'elephanta', 'elephanta'),
  ('ccc8dac9-29b3-5617-8d52-e219da1cdb55', 'nature', 'nature'),
  ('a68e6343-1dc7-5eed-b482-ab7c011f7af3', 'dadar', 'dadar'),
  ('2a546c99-26fc-5499-abf6-7bc09fc56930', 'temple', 'temple'),
  ('2a404d85-4a96-5fed-a915-e7ded8b4e86d', 'worli', 'worli'),
  ('3eaf8caf-7f8b-50fd-b14f-211aa86e2b21', 'juhu', 'juhu'),
  ('a58c3b55-aa63-53f6-97f8-1e88f2b4c2b7', 'beach', 'beach'),
  ('51b58ed5-09c9-5dc7-992f-e2ac57d7c6a9', 'bandra', 'bandra'),
  ('0c301910-c078-5402-8a7a-6773b1acafa1', 'market', 'market'),
  ('5bfa8cf3-9eea-5a2d-90d4-3604985c89db', 'bargains', 'bargains'),
  ('c8734502-e558-5040-978b-e6bcd7ab4716', 'borivali', 'borivali'),
  ('df2722a2-ca44-5847-a7c0-ce6ab8570423', 'sanjay-gandhi-np', 'sanjay gandhi np'),
  ('0a969317-60a6-59b1-b79d-f8e15c13bbd3', 'powai', 'powai'),
  ('f07c2cf1-1ec6-58ff-8304-1b053552c583', 'park', 'park'),
  ('257191da-0fed-5929-8470-4637061f2609', 'mall', 'mall'),
  ('48715161-17c5-531c-878e-ff74c7c7cacf', 'shopping', 'shopping'),
  ('1115f56e-a201-5ce4-8ed1-0b20d707411f', 'ghatkopar', 'ghatkopar'),
  ('702246e0-c3a2-5fe2-99c5-b8c3c08dbec7', 'grant-road', 'grant road'),
  ('dcfded5c-5a8e-5bb9-8b8a-843167998c9b', 'food-drinks', 'food & drinks'),
  ('83d1f249-d70c-5d9c-87d0-f6f3f194cbaa', 'food', 'food'),
  ('48de9604-e2d0-5c49-9d00-5971fec42992', 'coffee', 'coffee'),
  ('9ce621f9-1c39-5d58-bb2d-99e1c4a312d5', 'snacks', 'snacks'),
  ('05083457-413b-592d-a15b-edb7581488b9', 'andheri', 'andheri'),
  ('3a736dd3-7da3-5a25-8b11-f69ce657448f', 'bkc', 'bkc')
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, display_name = EXCLUDED.display_name;
COMMIT;
