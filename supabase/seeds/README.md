# Supabase Seeds

This folder holds repeatable seed inputs for Navya.

## Tester Seed Flow

The beginner tester flow is:

1. Sign in once through the app so a real Supabase user exists
2. Copy that user id from Supabase Auth
3. Render the SQL for that user:

```bash
npm run seed:tester -- YOUR_SUPABASE_USER_ID > /tmp/navya-tester-seed.sql
```

4. Run the generated SQL in the Supabase SQL editor
5. Render the validation SQL for the same user:

```bash
npm run validate:tester -- YOUR_SUPABASE_USER_ID > /tmp/navya-tester-validation.sql
```

6. Run the validation SQL in the Supabase SQL editor and confirm every row returns `pass`

The source template is:

- [templates/tester-seed.template.sql](/home/nikan/projects/navya/supabase/seeds/templates/tester-seed.template.sql)
- [templates/tester-validation.template.sql](/Users/nikankhadka/projects/navya/supabase/seeds/templates/tester-validation.template.sql)

The renderer is:

- [scripts/prepare-tester-seed.js](/home/nikan/projects/navya/scripts/prepare-tester-seed.js)
- [scripts/prepare-tester-validation.js](/Users/nikankhadka/projects/navya/scripts/prepare-tester-validation.js)
