-- Masar Job Tracker — Demo user seed data
--
-- Usage:
-- 1. In the Supabase Dashboard, go to Authentication -> Users -> Add user.
--    Email:    demo@masar.app   (or change the email below to match)
--    Password: anything you like
--    Check "Auto Confirm User" so it doesn't need an email confirmation.
-- 2. Run this whole file in the SQL Editor
--    (https://supabase.com/dashboard/project/_/sql/new).
-- 3. Sign in to the app with that demo user's email/password.
--
-- Safe to re-run: it wipes only this demo user's applications/contacts
-- first, then re-inserts a fresh set, so running it twice just resets
-- the demo data instead of duplicating it.

do $$
declare
  demo_user_id uuid;
begin
  select id into demo_user_id from auth.users where email = 'demo@masar.app';

  if demo_user_id is null then
    raise exception 'No user found with email demo@masar.app — create it first in Authentication > Users > Add user (or edit the email in this script to match the one you created).';
  end if;

  delete from public.contacts where user_id = demo_user_id;
  delete from public.applications where user_id = demo_user_id;

  insert into public.applications
    (user_id, company_name, role, location, job_url, job_description, score, status, date_applied, resume_version, cover_letter_sent, contact_person, salary_range, notes, source, date_last_updated)
  values
    (demo_user_id, 'OCP Group', 'Data Analyst', 'Casablanca', '', 'Analyze production and logistics data, build dashboards, work with SQL and Python across the phosphate value chain.', 82, 'Interview', current_date - 45, 'Resume_v3_DataAnalyst', true, 'Yasmine Alaoui — Talent Acquisition', '12,000 - 15,000 MAD', 'First interview went well, waiting on technical round scheduling.', 'LinkedIn', now() - interval '3 days'),
    (demo_user_id, 'Capgemini Maroc', 'Business Intelligence Consultant', 'Rabat', '', 'Design BI solutions for European clients, Power BI, data modeling, occasional travel to France.', 71, 'Applied', current_date - 12, 'Resume_v3_DataAnalyst', false, '', '', 'Applied via referral from a former classmate.', 'Referral', now() - interval '12 days'),
    (demo_user_id, 'Yassir', 'Product Data Analyst', 'Casablanca — Hybrid', '', 'Own the metrics for the ride-hailing product line, SQL-heavy, direct exposure to product leadership.', 91, 'Technical Test', current_date - 30, 'Resume_v4_Product', true, 'Karim Bennani — Engineering Manager', '14,000 - 18,000 MAD', 'Take-home SQL + Python case in progress.', 'Company Site', now() - interval '1 days'),
    (demo_user_id, 'Deloitte Maroc', 'Junior Data Consultant', 'Casablanca', '', 'Rotational analytics consulting role across banking and telecom clients.', 58, 'Rejected', current_date - 55, 'Resume_v3_DataAnalyst', true, '', '', 'Passed screening, rejected after case study round.', 'LinkedIn', now() - interval '20 days'),
    (demo_user_id, 'Fintech Startup (stealth)', 'Founding Analytics Hire', 'Remote', '', 'Early hire building the analytics stack from scratch for a Morocco-based fintech.', 66, 'Wishlist', null, '', false, '', '', 'Research the product more before applying.', 'Networking Event', now() - interval '2 days'),
    (demo_user_id, 'Attijariwafa Bank', 'Data Analyst', 'Casablanca', '', 'Support retail banking analytics, credit risk dashboards, SQL and Tableau.', 75, 'Phone Screen', current_date - 20, 'Resume_v3_DataAnalyst', true, 'Sara El Fassi — HR Business Partner', '', 'Phone screen scheduled for next week.', 'LinkedIn', now() - interval '5 days'),
    (demo_user_id, 'Intelcia', 'Business Analyst', 'Casablanca', '', 'Operational reporting for outsourcing client accounts.', 63, 'Applied', current_date - 8, 'Resume_v2_Generalist', false, '', '', '', 'Indeed', now() - interval '8 days'),
    (demo_user_id, 'Sopra Steria Maroc', 'BI Developer', 'Rabat', '', 'Build and maintain BI pipelines for banking clients, SSIS and Power BI.', 70, 'Phone Screen', current_date - 25, 'Resume_v4_Product', true, 'Omar Tazi — Hiring Manager', '', 'Waiting to hear back after phone screen.', 'Company Site', now() - interval '6 days'),
    (demo_user_id, 'Orange Maroc', 'Data Scientist', 'Rabat', '', 'Churn modeling and network usage analytics for telecom subscriber base.', 88, 'Interview', current_date - 35, 'Resume_v4_Product', true, 'Youssef Amrani — Recruiter', '16,000 - 20,000 MAD', 'Onsite interview scheduled.', 'Referral', now() - interval '4 days'),
    (demo_user_id, 'Marsh Morocco', 'Data Analyst', 'Casablanca', '', 'Insurance brokerage reporting and client data analysis.', 55, 'Rejected', current_date - 50, 'Resume_v2_Generalist', false, '', '', 'Rejected after initial screen.', 'LinkedIn', now() - interval '35 days'),
    (demo_user_id, 'CFAO Motors', 'Business Intelligence Analyst', 'Casablanca', '', 'Automotive distribution sales and inventory analytics.', 60, 'Applied', current_date - 15, 'Resume_v2_Generalist', false, '', '', '', 'Indeed', now() - interval '15 days'),
    (demo_user_id, 'Ubisoft Casablanca', 'Data Analyst', 'Casablanca', '', 'Player behavior analytics for live-service game titles.', 85, 'Offer', current_date - 60, 'Resume_v4_Product', true, 'Nadia Cherkaoui — Talent Acquisition', '18,000 - 22,000 MAD', 'Offer received, negotiating start date.', 'Referral', now() - interval '2 days'),
    (demo_user_id, 'Renault Group Morocco', 'Supply Chain Data Analyst', 'Tangier', '', 'Production planning analytics for the Tangier manufacturing plant.', 68, 'Applied', current_date - 10, 'Resume_v3_DataAnalyst', true, '', '', '', 'Company Site', now() - interval '10 days'),
    (demo_user_id, 'Webhelp Morocco', 'Reporting Analyst', 'Casablanca', '', 'Client reporting dashboards for BPO operations.', 50, 'Rejected', current_date - 48, 'Resume_v2_Generalist', false, '', '', 'Rejected — not enough call center analytics experience.', 'Indeed', now() - interval '40 days'),
    (demo_user_id, 'Maroc Telecom', 'Data Analyst', 'Rabat', '', 'Subscriber and network usage reporting.', 78, 'Phone Screen', current_date - 18, 'Resume_v3_DataAnalyst', true, '', '', 'Phone screen went well.', 'LinkedIn', now() - interval '7 days'),
    (demo_user_id, 'LafargeHolcim Maroc', 'BI Analyst', 'Casablanca', '', 'Production and sales analytics for cement manufacturing.', 65, 'Applied', current_date - 6, 'Resume_v3_DataAnalyst', false, '', '', '', 'Company Site', now() - interval '6 days'),
    (demo_user_id, 'Wafa Assurance', 'Data Analyst', 'Casablanca', '', 'Insurance claims and underwriting analytics.', 72, 'Technical Test', current_date - 22, 'Resume_v4_Product', true, 'Mehdi Alami — Data Team Lead', '', 'Technical case study due this week.', 'Referral', now() - interval '3 days'),
    (demo_user_id, 'HR Tech Startup', 'Data/Analytics Generalist', 'Remote', '', 'Early-stage HR tech product, analytics and reporting.', 59, 'Withdrawn', current_date - 40, 'Resume_v2_Generalist', false, '', '', 'Withdrew after learning about the compensation structure.', 'Networking Event', now() - interval '25 days'),
    (demo_user_id, 'Mutandis', 'Business Analyst', 'Casablanca', '', 'FMCG sales and distribution analytics.', 62, 'Wishlist', null, '', false, '', '', 'On the list, need a referral first.', 'LinkedIn', now() - interval '1 days'),
    (demo_user_id, 'Akwa Group', 'Data Analyst', 'Casablanca', '', 'Energy distribution network analytics.', 80, 'Applied', current_date - 4, 'Resume_v4_Product', true, '', '', '', 'Company Site', now() - interval '4 days');

  insert into public.contacts
    (user_id, name, title, company, linkedin_url, email, phone, application_id, status, date_contacted, notes, date_last_updated)
  values
    (demo_user_id, 'Yasmine Alaoui', 'Talent Acquisition', 'OCP Group', '', '', '', (select id from public.applications where user_id = demo_user_id and company_name = 'OCP Group' limit 1), 'Responded', current_date - 40, 'Reached out on LinkedIn after applying, she confirmed receipt and flagged it to the hiring manager.', now() - interval '3 days'),
    (demo_user_id, 'Karim Bennani', 'Engineering Manager', 'Yassir', '', '', '', (select id from public.applications where user_id = demo_user_id and company_name = 'Yassir' limit 1), 'Interviewing Me', current_date - 20, 'Leading the technical interview process, very responsive over email.', now() - interval '1 days'),
    (demo_user_id, 'Sara El Fassi', 'HR Business Partner', 'Attijariwafa Bank', '', '', '', (select id from public.applications where user_id = demo_user_id and company_name = 'Attijariwafa Bank' limit 1), 'Responded', current_date - 15, 'Confirmed phone screen date over email.', now() - interval '5 days'),
    (demo_user_id, 'Youssef Amrani', 'Recruiter', 'Orange Maroc', '', '', '', (select id from public.applications where user_id = demo_user_id and company_name = 'Orange Maroc' limit 1), 'Called Me', current_date - 30, 'Called directly about the Data Scientist opening before I had even seen the posting.', now() - interval '4 days'),
    (demo_user_id, 'Nadia Cherkaoui', 'Talent Acquisition', 'Ubisoft Casablanca', '', '', '', (select id from public.applications where user_id = demo_user_id and company_name = 'Ubisoft Casablanca' limit 1), 'Referred Me', current_date - 58, 'Internal referral from a former teammate, she fast-tracked the application.', now() - interval '2 days'),
    (demo_user_id, 'Hamza Idrissi', 'Recruiter', 'Independent / Agency', '', '', '', null, 'Reached Out', current_date - 5, 'Messaged on LinkedIn about a few open data roles, still waiting to hear back on details.', now() - interval '5 days'),
    (demo_user_id, 'Leila Bouzid', 'HR Manager', 'Deloitte Maroc', '', '', '', (select id from public.applications where user_id = demo_user_id and company_name = 'Deloitte Maroc' limit 1), 'No Response', current_date - 50, 'Sent a follow-up after the case study round, no reply since.', now() - interval '20 days'),
    (demo_user_id, 'Omar Tazi', 'Hiring Manager', 'Sopra Steria Maroc', '', '', '', (select id from public.applications where user_id = demo_user_id and company_name = 'Sopra Steria Maroc' limit 1), 'Responded', current_date - 24, 'Confirmed next steps after the phone screen.', now() - interval '6 days'),
    (demo_user_id, 'Rania Squalli', 'Alumni Network Contact', '', '', '', '', null, 'Cold', current_date - 70, 'Talked at an alumni event about the job market, conversation fizzled out.', now() - interval '45 days'),
    (demo_user_id, 'Mehdi Alami', 'Data Team Lead', 'Wafa Assurance', '', '', '', (select id from public.applications where user_id = demo_user_id and company_name = 'Wafa Assurance' limit 1), 'Interviewing Me', current_date - 21, 'Running the technical case study review.', now() - interval '3 days');

  raise notice 'Seeded % applications and % contacts for demo user %',
    (select count(*) from public.applications where user_id = demo_user_id),
    (select count(*) from public.contacts where user_id = demo_user_id),
    demo_user_id;
end $$;
