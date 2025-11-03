-- Fix contact_id_seq sequence to sync with existing data
-- This should be run if you're getting unique constraint violations on contact.id

-- Reset the sequence to the maximum ID value in the contact table
SELECT setval(
    'public.contact_id_seq',
    COALESCE((SELECT MAX(id) FROM public.contact), 1),
    true
);

-- Verify the sequence value
SELECT currval('public.contact_id_seq') as current_sequence_value;
SELECT MAX(id) as max_contact_id FROM public.contact;

