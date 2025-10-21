-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admins (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email character varying NOT NULL UNIQUE,
  role character varying DEFAULT 'editor'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying::text, 'editor'::character varying::text, 'viewer'::character varying::text])),
  created_at timestamp with time zone DEFAULT now(),
  name text,
  avatar text,
  password text,
  banned boolean,
  CONSTRAINT admins_pkey PRIMARY KEY (id)
);
CREATE TABLE public.buses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  bus_code text,
  driver bigint,
  letter boolean,
  e_payment bigint,
  contract_date date,
  agreed_date date,
  date_collected date,
  start_date date,
  first_pay date,
  initial_owe bigint,
  deposited bigint,
  t_income bigint,
  plate_no text,
  coordinator bigint,
  CONSTRAINT buses_pkey PRIMARY KEY (id),
  CONSTRAINT buses_driver_fkey FOREIGN KEY (driver) REFERENCES public.driver(id),
  CONSTRAINT buses_coordinator_fkey FOREIGN KEY (coordinator) REFERENCES public.coordinators(id)
);
CREATE TABLE public.co_subject (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  subject text,
  CONSTRAINT co_subject_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contact (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  coordinator bigint,
  driver bigint,
  subject bigint,
  transaction_date date,
  message text,
  is_starred boolean,
  is_read boolean,
  attachment text,
  sender text,
  receiver text,
  sender_email text,
  receiver_email text,
  CONSTRAINT contact_pkey PRIMARY KEY (id),
  CONSTRAINT contact_coordinator_fkey FOREIGN KEY (coordinator) REFERENCES public.coordinators(id),
  CONSTRAINT contact_driver_fkey FOREIGN KEY (driver) REFERENCES public.driver(id),
  CONSTRAINT contact_subject_fkey FOREIGN KEY (subject) REFERENCES public.subject(id)
);
CREATE TABLE public.contact_us (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  email text,
  phone text,
  company text,
  subject text,
  message text,
  CONSTRAINT contact_us_pkey PRIMARY KEY (id)
);
CREATE TABLE public.coordinators (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  password text,
  name text,
  avatar text,
  phone ARRAY,
  user_id uuid UNIQUE,
  banned boolean,
  CONSTRAINT coordinators_pkey PRIMARY KEY (id)
);
CREATE TABLE public.driver (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  email text,
  password text,
  name text,
  avatar text,
  dob text,
  nin bigint,
  phone ARRAY,
  address ARRAY,
  kyc boolean,
  banned boolean,
  CONSTRAINT driver_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  slug character varying NOT NULL UNIQUE,
  text text NOT NULL,
  meta_description text,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  hero_big_black text,
  hero_big_primary text,
  hero_text text,
  hero_primary_button text,
  hero_secondary_button text,
  hero_year text,
  hero_year_span text,
  hero_100 text,
  hero_100_span text,
  hero_24 text,
  hero_24_span text,
  body_heading text,
  body_sub_heading text,
  body_first_text text,
  body_second_text text,
  body_heading2 text,
  body_sub_heading2 text,
  body_heading3 text,
  body_sub_heading3 text,
  body_heading4 text,
  body_sub_heading4 text,
  box_text text,
  box_head text,
  box_text2 text,
  box_head2 text,
  box_text3 text,
  box_head3 text,
  box_text4 text,
  box_head4 text,
  box_text5 text,
  box_head5 text,
  box_text6 text,
  box_head6 text,
  box_text7 text,
  box_head7 text,
  box_text8 text,
  box_head8 text,
  box_text9 text,
  box_head9 text,
  team_img text,
  team_text text,
  team_role text,
  team_img2 text,
  team_text2 text,
  team_role2 text,
  team_img3 text,
  team_text3 text,
  team_role3 text,
  section_head text,
  section_text text,
  section_primary_btn text,
  section_secondary_btn text,
  hp ARRAY,
  fm ARRAY,
  CONSTRAINT pages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  week date,
  coordinator text,
  bus bigint,
  p_week text,
  receipt text,
  amount bigint,
  sender text,
  payment_day text,
  payment_date date,
  pay_type text,
  pay_complete text,
  issue text,
  inspection text,
  completed_by text,
  CONSTRAINT payment_pkey PRIMARY KEY (id),
  CONSTRAINT payment_bus_fkey FOREIGN KEY (bus) REFERENCES public.buses(id)
);
CREATE TABLE public.settings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  phone ARRAY,
  email ARRAY,
  address text,
  logo text,
  footer_write text,
  footer_head text,
  footer_head2 text,
  services ARRAY,
  bottom_left text,
  bottom_right ARRAY,
  logo_blk text,
  CONSTRAINT settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.subject (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  subject text,
  CONSTRAINT subject_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  role character varying DEFAULT 'user'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying::text, 'user'::character varying::text, 'driver'::character varying::text])),
  created_at timestamp with time zone DEFAULT now(),
  name text,
  avatar text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

create index IF not exists idx_pages_slug on public.pages using btree (slug) TABLESPACE pg_default;

create index IF not exists idx_pages_published on public.pages using btree (is_published) TABLESPACE pg_default;

INSERT INTO "public"."admins" ("id", "email", "role", "created_at", "name", "avatar", "password", "banned") VALUES 
('1', 'admin@annhurst-gsl.com', 'admin', '2025-09-06 19:05:45+00', 'Administrator', null, '123', 'false'), 
('2', 'dutibe@annhurst-gsl.com', 'editor', '2025-10-08 11:24:42+00', 'David', null, '123', 'false'), 
('3', 'deboraheidehen@gmail.com', 'viewer', '2025-10-08 11:28:49+00', 'Deborah', null, '123', 'false');

INSERT INTO "public"."settings" ("id", "created_at", "phone", "email", "address", "logo", "footer_write", "footer_head", "footer_head2", "services", "bottom_left", "bottom_right", "logo_blk") VALUES ('1', '2025-09-14 10:30:22.599753+00', '"{\"+234 809 318 3556\"]}', '"{\"customerservices@annhurst-gsl.com\"]}', '13B Obafemi Anibaba
                      Admiralty Way Lekki
                      Lagos, Nigeria', 'settings/1759583109440-ats1.png', 'Your trusted partner in bus higher purchase solutions. We provide comprehensive financing options for transportation businesses across the globe.', 'Quick Links', 'Our Services', '"{\"Bus Financing\",\"Higher Purchase\",\"Lease Options\",\"Fleet Management\",\"Insurance Solutions\"]}', 'Annhurst Transport Service Limited. All rights reserved.', '"{\"Privacy Policy\",\"Terms of Service\"]}', 'settings/1759582964099-ats.png');

INSERT INTO "public"."payment" ("id", "created_at", "week", "coordinator", "bus", "p_week", "receipt", "amount", "sender", "payment_day", "payment_date", "pay_type", "pay_complete", "issue", "inspection", "completed_by") VALUES ('1', '2025-09-10 19:47:48.320545+00', '2025-09-08', 'Cleophas', '1', 'First', 'L07,N100000,06.09.2025,DR Receipt.PNG', '100000', 'Elizabeth Mary', 'SAT', '2025-09-06', 'ACCOUNT', 'YES', 'NO', 'YES', 'Cleophas'), ('2', '2025-09-10 21:08:11.150383+00', '2025-09-08', 'Cleophas', '4', 'First', 'L08,N65000,08.09.2025,DR Receipt.PNG', '65000', 'Taiwo Tola Seun', 'MON', '2025-09-08', 'ACCOUNT', 'YES', 'Bus to be Repossessed', 'YES', 'Cleophas'), ('3', '2025-09-12 17:11:12.749933+00', '2025-07-21', 'Emmanuel', '3', 'First', 'M01,N65000,20.07.2025,DR Receipt.png', '65000', 'OLADAYO SUNDAY ALAO', 'SUN', '2025-07-20', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), ('4', '2025-09-12 17:14:25.893182+00', '2025-07-28', 'Emmanuel', '3', 'First', 'M01,N28000,29.07.2025,DR Receipt.png', '28000', 'OLADAYO SUNDAY ALAO', 'TUE', '2025-07-29', 'ACCOUNT', 'YES', 'Bus Down', 'YES', 'Emmanuel'), ('5', '2025-09-12 17:17:31.774975+00', '2025-08-04', 'Emmanuel', '3', 'First', 'M01,N65000,03.08.2025,DR Receipt.png', '65000', 'M1 WEEK', 'SUN', '2025-08-03', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), ('6', '2025-09-12 17:20:49.346927+00', '2025-08-11', 'Emmanuel', '3', 'First', 'M01,N65000,10.08.2025,DR Receipt.png', '65000', 'M1 WEEK', 'SUN', '2025-08-10', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), ('7', '2025-09-12 17:24:20.437072+00', '2025-08-18', 'Emmanuel', '3', 'First', 'M01,N40000,17.08.2025,DR Receipt.png', '40000', 'M1 WEEK', 'SUN', '2025-08-17', 'ACCOUNT', 'NO', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), ('8', '2025-09-12 17:25:42.431135+00', '2025-08-18', 'Emmanuel', '3', 'Second', 'M01,N25000,18.08.2025,DR Receipt.png', '25000', 'M1 WEEK', 'MON', '2025-08-18', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), ('9', '2025-09-12 17:41:50.897095+00', '2025-08-25', 'Emmanuel', '3', 'First', 'M01,N65000,24.08.2025,DR Receipt.png', '65000', 'M1 WEEK', 'SUN', '2025-08-24', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), ('10', '2025-09-12 17:44:50.821564+00', '2025-09-01', 'Emmanuel', '3', 'First', 'M01,N65000,31.08.2025,DR Receipt.png', '65000', 'M1 WEEK', 'SUN', '2025-08-31', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), ('11', '2025-09-12 17:47:09.09852+00', '2025-09-08', 'Emmanuel', '3', 'First', 'M01,N65000,08.09.2025,DR Receipt.png', '65000', 'OLADAYO SUNDAY ALAO', 'SUN', '2025-09-08', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel');

INSERT INTO "public"."pages" ("id", "title", "slug", "text", "meta_description", "is_published", "created_at", "updated_at", "hero_big_black", "hero_big_primary", "hero_text", "hero_primary_button", "hero_secondary_button", "hero_year", "hero_year_span", "hero_100", "hero_100_span", "hero_24", "hero_24_span", "body_heading", "body_sub_heading", "body_first_text", "body_second_text", "body_heading2", "body_sub_heading2", "body_heading3", "body_sub_heading3", "body_heading4", "body_sub_heading4", "box_text", "box_head", "box_text2", "box_head2", "box_text3", "box_head3", "box_text4", "box_head4", "box_text5", "box_head5", "box_text6", "box_head6", "box_text7", "box_head7", "box_text8", "box_head8", "box_text9", "box_head9", "team_img", "team_text", "team_role", "team_img2", "team_text2", "team_role2", "team_img3", "team_text3", "team_role3", "section_head", "section_text", "section_primary_btn", "section_secondary_btn", "hp", "fm") VALUES 
('1391f72c-5f72-4060-bf8f-9a0aacc939b3', 'About Us', 'about', 'Our impact in numbers', 'Learn about our company mission and values', 'true', '2025-08-12 01:25:38.91574+00', '2025-08-12 01:25:38.91574+00', 'About', 'Annhurst Transport', 'Leading the way in bus higher purchase solutions across Nigeria and beyond', null, null, null, null, null, null, null, null, 'Our Story', null, 'Founded with a vision to democratize investment opportunities in Nigeria, Annhurst Transport Services Limited has been at the forefront of providing accessible, profitable investment options for individuals and businesses across the country.', 'With over 5 years of proven excellence, we have built a reputation for reliability, transparency, and consistent returns. Our expertise spans across transportation, real estate, and business expansion sectors, making us your one-stop solution for investment opportunities.', 'Driving growth in transportation', 'Our Purpose', 'The principles that guide us', 'Our Values', 'Meet the experts behind our success', 'Our Team', 'To provide accessible, reliable, and innovative financing solutions that empower transportation businesses to grow their fleets and expand their operations, contributing to economic development across Nigeria.', 'Our Mission', 'To be the leading provider of transportation financing solutions in West Africa, recognized for our innovation, reliability, and commitment to customer success.', 'Our Vision', 'We put our customers at the heart of everything we do, ensuring their success is our priority.', 'Customer First', 'We strive for excellence in all aspects of our business, from customer service to financial solutions.', 'Excellence', 'We continuously innovate our services to meet the evolving needs of the transportation industry.', 'Innovation', 'Years in Business', '5+', 'Buses Financed', '200+', 'Satisfied Clients', '100+', 'Team Members', '25+', null, 'Strategic leadership and vision', 'Management Team', null, 'Specialized in transportation financing', 'Finance Experts', null, 'Dedicated to your success', 'Customer Support', null, 'Our team of experienced professionals brings together decades of expertise in transportation finance, customer service, and business development.', null, null, null, null), 
('3e06e905-1392-444d-af16-d562a5e7b1f6', 'Services', 'services', 'From 12% APR', 'Comprehensive bus financing and management services', 'true', '2025-08-12 01:25:38.91574+00', '2025-08-12 01:25:38.91574+00', 'Our', 'Services', 'Comprehensive bus financing solutions designed to help your transportation business grow and succeed', 'Get Started', 'Learn More', 'Custom Pricing', null, null, null, null, null, 'Complete financing solutions', 'What We Offer', 'From initial consultation to final payment, we provide end-to-end support for all your bus financing needs.', null, 'Simple 4-step process', 'How It Works', 'Benefits that set us apart', 'Why Choose Us', 'We''re here to help you succeed', 'Additional Support', 'Our flagship service offering flexible higher purchase agreements for buses of all sizes and types. Perfect for businesses looking to expand their fleet while maintaining operational cash flow.', 'Higher Purchase', 'Comprehensive fleet management services to help you optimize operations, reduce costs, and maximize the value of your bus fleet investment.', 'Fleet Management', 'Submit your application with basic business information and requirements', 'Application', 'Our team reviews your application and conducts necessary assessments', 'Review', 'Receive approval and finalize terms of your financing agreement', 'Approval', 'Get your buses and start growing your transportation business', 'Funding', 'We offer some of the most competitive interest rates in the industry, helping you save money on your financing.', 'Competitive Rates', 'Our streamlined process ensures quick approval and funding, so you can get your buses on the road faster.', 'Fast Processing', 'Your financial information is protected with bank-level security, and our services are backed by years of experience.', 'Secure & Reliable', null, 'We help you gather and organize all necessary documents for a smooth application process.', 'Documentation Support', null, 'Our customer support team is available around the clock to answer your questions and provide assistance.', '24/7 Support', null, 'Get expert advice on fleet expansion, route optimization, and business growth strategies.', 'Business Consulting', 'Ready to get started?', 'Contact our team today to discuss your bus financing needs and discover how we can help you grow your transportation business.', 'Contact Us', 'Learn More', '"{\"Competitive interest rates\",\"Flexible payment terms\",\"Quick approval process\",\"No hidden fees\"]}', '"{\"Maintenance scheduling\",\"Insurance management\",\"Performance tracking\",\"Cost optimization\"]}'), 
('6d731d5e-638b-47cb-b216-337144749b92', 'Contact', 'contact', 'Located in the heart of Lagos business district, our office is easily accessible and ready to welcome you.', 'Contact information and inquiry form', 'true', '2025-08-12 01:25:38.91574+00', '2025-08-12 01:25:38.91574+00', 'Contact', 'Us', 'Ready to expand your bus fleet? Get in touch with our team today and discover how we can help you grow your transportation business.', 'Call Now', 'Email', 'I have a bus', '+234 809 318 3556', '+234 706 522 6741', 'customerservices@annhurst-gsl.com', null, 'Info@annhurst-gsl.com', 'Send us a message', null, 'Full Name *', null, 'Get in touch', null, 'Visit our office', 'Find Us', 'Frequently asked questions', 'FAQ', 'You''ll need your business registration documents, financial statements, driver''s license, and proof of income. Our team will provide a complete checklist during your initial consultation.', 'What documents do I need to apply for bus financing?', 'Typically, we can provide approval within 2-3 business days for complete applications. The entire process from application to funding usually takes 1-2 weeks.', 'How long does the approval process take?', 'We finance all types of buses including minibuses, coaches, school buses, and luxury buses. We work with both new and used vehicles from reputable manufacturers.', 'What types of buses do you finance?', 'Yes, we offer refinancing solutions for existing bus loans. This can help you get better rates or more favorable terms. Contact us to discuss your options.', 'Do you offer refinancing options?', 'Our customer support team is available to help you with urgent inquiries and quick questions about our services.', 'Need immediate assistance?', 'Send Message', 'Monday - Friday: 8:00 AM - 6:00 PM', 'Saturday: 9:00 AM - 2:00 PM', 'Sunday: Closed', '13B Obafemi Anibaba', 'Admiralty Way Lekki', 'Lagos, Nigeria', 'Email Address *', 'Phone Number', 'Company Name', 'Service of Interest', 'Message *', null, null, null, null, null, null, null, null, null, null, null), 
('7c86a21a-b11c-4bcc-9573-6ad5b986a0b9', 'Home', 'home', 'Investment Success', 'Leading provider of bus financing and fleet management services', 'true', '2025-08-12 01:25:38.91574+00', '2025-08-12 01:25:38.91574+00', 'Bus Higher Purchase', 'Solutions', 'Annhurst Transport Service Limited provides comprehensive bus financing solutions for transportation businesses. Get your fleet on the road with our flexible higher purchase options.', 'Explore Services', 'Get Started', '5+', 'Years of excellence', '100%', 'On-Time-Payments', '24/7', 'Customer Support', 'Everything you need for your bus fleet', 'Why Choose Us', 'We understand the challenges of running a transportation business. That''s why we''ve designed our services to be flexible, reliable, and tailored to your needs.', 'High Returns', 'Comprehensive bus financing solutions', 'Our Services', 'Trusted by transportation businesses', 'Join hundreds of successful companies who have grown their fleet with us', null, null, 'Our secure financing options ensure you get the best rates while maintaining financial stability for your business.', 'Secure Financing', 'Fast approval process with minimal documentation requirements. Get your buses on the road in record time.', 'Quick Approval', 'Our team of transportation finance experts is here to guide you through every step of the process.', 'Expert Support', 'Flexible higher purchase agreements with competitive interest rates. Own your buses while maintaining cash flow for operations.', 'Higher Purchase', 'Comprehensive fleet management services including maintenance scheduling, insurance, and operational support.', 'Fleet Management', 'Buses Financed', '200+', 'Happy Clients', '100+', 'Years Experience', '5+', 'Success Rate', '98%', 'Bus Investment ROI', 'Customer Satisfaction', '98%', null, null, null, null, null, null, 'Ready to expand your fleet?', 'Get in touch with our team today and discover how we can help you grow your transportation business.', 'Contact Us', 'Learn More', null, null);

INSERT INTO "public"."driver" ("id", "created_at", "email", "password", "name", "avatar", "dob", "nin", "phone", "address", "kyc", "banned") VALUES ('1', '2025-09-02 13:43:03.089671+00', 'taiwo@annhurst-gsl.com', '123456', 'Taiwo Tola Seun', null, '1990-01-01', '1234567890', '"{\"08164645709\",\"09116140644\"]}', '"{\"   \\t AGBEDE TRANSFORMER, LAST BUS STOP, BALE OLOMI HOUSE, OFF AGRIC, IKORODU, LAGOS\"]}', 'true', 'false'), ('2', '2025-09-03 11:27:20.646577+00', 'oladayo@annhurst-gsl.com', '123456', 'OLADAYO CHRISTOPHER SUNDAY', null, '1990-01-02', '1234567890', '"{\"09038065002\"]}', '"{\"4, TRANSIT VILLAGE, ADETOKUNBO ADEMOLA, VICTORIA ISLAND\"]}', 'false', 'false'), ('3', '2025-09-03 15:38:43.477276+00', 'essien@annhurst-gsl.com', '123456', 'ESSIEN ELIZABETH', null, '1990-01-04', '12345678901', '"{\"08056311132\",\"08065095594\"]}', '"{\"PLOT 23, RD 13, LEKKI ATLANTIC GARDEN ESTATE, AJAH, LAGOS\",\"PLOT 35, RD 13, LEKKI ATLANTIC GARDEN ESTATE, AJAH LAGOS STATE\"]}', 'false', 'false'), ('4', '2025-09-09 19:03:26.010955+00', 'musibau@annhurst-gsl.com', '123456', 'ODEDELE MUSIBAU OLALEKAN', null, '1990-02-09', '12345678901', '"{\"08109928060\"]}', '"{\"Plot 250 Elegushi Beach Lagos Nigeria\",\"19 Balogun street Ejigbo Lagos Nigeria\"]}', 'false', 'false'), ('5', '2025-09-09 19:10:17.33252+00', 'kenedy@annhurst-gsl.com', '123456', 'Kenedy Idialu', null, '1990-02-09', '12345678901', '"{\"09016289173\"]}', '"{\"Mama Bar street, Itedo Lekki Lagos Nigeria\"]}', 'false', 'false'), ('6', '2025-09-09 19:21:40.05115+00', 'ismaheel@annhurst-gsl.com', '123456', 'Ismaheel Lawal', null, '1990-01-09', '12345678901', '"{\"08114660214\"]}', '"{\"30 Lekki farm road, After farm City, Lekki phase 1, Lagos Nigeria\"]}', 'false', 'false'), ('7', '2025-09-09 19:25:05.458917+00', 'bashiru@annhurst-gsl.com', '123456', 'Bashiru Kunmi Sunday', null, '1990-05-09', '12345678901', '"{\"08037397161\"]}', '"{\"HSE 2, Okunusi Mopo off Oyinbo Road, Ajah Lagos Nigeria\"]}', 'false', 'false'), ('8', '2025-09-09 19:37:39.219766+00', 'ayodele@annhurst-gsl.com', '123456', 'Ayodele Rasheed', null, '1990-09-09', '12345678901', '"{\"08112756959\"]}', '"{\"Ojo-Oto Bulala bus stop Okun Mopo Abraham Adesanya Ajah Lagos Nigeria\"]}', 'false', 'false'), ('9', '2025-09-09 19:41:04.361639+00', 'sanusi@annhurst-gsl.com', '123456', 'Sanusi Taofeek Adesina', null, '1989-05-09', '12345678901', '"{\"07062771436\"]}', '"{\"Plot 2, Layi yusuf crescent, off admiralty way lekki phase 1 Lagos Nigeria \"]}', 'false', 'false'), ('10', '2025-09-09 19:43:57.3302+00', 'abdullahi@annhurst-gsl.com', '123456', 'Abdullahi Yusuf', null, '1990-01-09', '12345678901', '"{\"07089670810\"]}', '"{\"1, Saka Oluguna orile maroko, Ajah Lagos Nigeria \"]}', 'false', 'false'), ('11', '2025-09-09 19:47:03.356862+00', 'aderemi@annhurst-gsl.com', '123456', 'Aderemi Rufai Safiu', null, '1990-10-09', '12345678901', '"{\"08119946144\"]}', '"{\"Ifedapo street, Baba nla lekki farm Lagos Nigeria \"]}', 'false', 'false'), ('12', '2025-09-09 19:51:07.305076+00', 'fadare@annhurst-gsl.com', '123456', 'Fadare Sarafadeen Adewale', null, '1990-12-09', '12345678901', '"{\"08136194190\"]}', '"{\"11 Akilo Road, Agege Ogba road, Agege Lagos Nigeria \"]}', 'false', 'false'), ('13', '2025-09-09 19:55:14.004251+00', 'adepoju@annhurst-gsl.com', '123456', 'Adepoju Babatunde Adebowale', null, '1990-10-09', '12345678901', '"{\"09138461046\"]}', '"{\"17 Temidire Ajaguro Imota Ikorodu Lagos Nigeria \"]}', 'false', 'false'), ('14', '2025-09-09 19:59:41.54392+00', 'damola@annhurst-gsl.com', '123456', 'DAMOLA SHOWOBI MUMEEN', null, '1990-05-09', '12345678901', '"{\"08030779806\"]}', '"{\"Back of poultry, green house, tipper garage bus stop, eleko Lagos Nigeria \"]}', 'false', 'false'), ('15', '2025-09-09 20:02:22.005202+00', 'kolajo@annhurst-gsl.com', '123456', 'Kolajo Isaac', null, '1990-11-09', '12345678901', '"{\"08033697112\"]}', '"{\"5, Sanni Eleku street, Awoyaya, ibeju Lekki Lagos Nigeria\"]}', 'false', 'false'), ('16', '2025-09-09 20:06:18.988416+00', 'maliki@annhurst-gsl.com', '123456', 'Maliki Simpa Yahaya', null, '1990-06-09', '12345678901', '"{\"08070518881\",\"09130461493\"]}', '"{\"48, TALABI STR, OKE IJEBU ODONLA IKORODU\"]}', 'false', 'false'), ('17', '2025-09-09 20:10:28.303862+00', 'hange@annhurst-gsl.com', '123456', 'HANGE TERHEMEN BENJAMIN', null, '1990-04-09', '12345678901', '"{\"08146923004\"]}', '"{\"6, Oluwalogbon Oworonshoki Lagos Nigeria \"]}', 'false', 'false'), ('18', '2025-09-09 20:18:44.916773+00', 'ajayi@annhurst-gsl.com', '123456', 'Ajayi Akorede Segun', null, '1990-12-09', '12345678901', '"{\"08028316736\"]}', '"{\"21B Adedayo Adedeji street, Abanje road, IKOTUN Lagos Nigeria \"]}', 'false', 'false'), ('19', '2025-09-11 08:35:22.296693+00', 'ridwan@annhurst-gsl.com', '123456', 'OLAMILEKAN RIDWAN', null, '1990-01-10', '12345678901', '"{\"07065705493\"]}', '"{\"169 PRINCE ADEMOLA ROAD OFF ONIRU ESTATE\"]}', 'false', 'false'), ('20', '2025-09-11 08:37:34.140639+00', 'abbas@annhurst-gsl.com', '123456', 'ABBAS ABDULLAHI', null, '1990-07-24', '12345678901', '"{\"08028453325\"]}', '"{\"7, MOBIL ROAD, AJAH\"]}', 'false', 'false'), ('21', '2025-09-11 08:46:54.179078+00', 'livinus@annhurst-gsl.com', '123456', 'LIVINUS PETER AKWITAL', null, '1990-10-15', '12345678901', '"{\"08113049993\"]}', '"{\"3/4, ODO OGUN CLOSE OFF KEFFI OBALENDE\"]}', 'false', 'false'), ('22', '2025-09-11 08:50:35.878948+00', 'olaoye@annhurst-gsl.com', '123456', 'OLAOYE OLADEJI', null, '1990-12-16', '12345678901', '"{\"07012298111\"]}', '"{\"PRIME OLAYINKA STR, MOBILE ROAD, AJAH\"]}', 'false', 'false'), ('23', '2025-09-11 08:53:00.802054+00', 'balogun@annhurst-gsl.com', '123456', 'OLARENWAJU YUSUF BALOGUN', null, '1990-05-13', '12345678901', '"{\"08147117310\"]}', '"{\"10 AGUGI AJIREN LEKKI LAGOS NIGERIA\"]}', 'false', 'false'), ('24', '2025-09-11 08:55:43.24896+00', 'laitan@annhurst-gsl.com', '123456', 'LAITAN TAJUDEEN SHOWOBI', null, '1990-02-22', '12345678901', '"{\"08028871638\"]}', '"{\"18, ALPHA BEACH, NEW ROAD LEKKI\"]}', 'false', 'false'), ('25', '2025-09-11 08:58:09.018855+00', 'muritala@annhurst-gsl.com', '123456', 'MURITALA AKANDE ORI-ADE', null, '1990-08-08', '12345678901', '"{\"09075800613\"]}', '"{\"3, ATUNRASE ALAKUKO AGBADO\"]}', 'false', 'false'), ('26', '2025-09-11 09:00:19.32366+00', 'abini@annhurst-gsl.com', '123456', 'MONDAY ABINI AJAYI', null, '1990-09-17', '12345678901', '"{\"09067083030\",\"07060853526\"]}', '"{\"54, ISALE IJEBU STREET, AJAH LAGOS\"]}', 'false', 'false'), ('27', '2025-09-11 09:03:39.050814+00', 'ihedigbo@annhurst-gsl.com', '123456', 'JOSHUA IHEDIGBO', null, '1990-09-17', '12345678901', '"{\"09125699739\"]}', '"{\"ROAD 6, RIO GARDEN ESTATE ARAROMI\"]}', 'false', 'false'), ('28', '2025-09-11 09:06:17.540926+00', 'samson@annhurst-gsl.com', '123456', 'MONDAY SAMSON UDOETETE', null, '1990-12-06', '12345678901', '"{\"08141517792\"]}', '"{\"8, OWOPEJO  CLOSE, SHAPATI IBEJU LEKKI\"]}', 'false', 'false'), ('29', '2025-09-11 09:10:31.233888+00', 'aderibigbe@annhurst-gsl.com', '123456', 'LANRE ADERIBIGBE', null, '1990-04-29', '12345678901', '"{\"08038295709\"]}', '"{\"12, BALEGI AVENUE, IGODO MAGBORO OGUN STATE\"]}', 'false', 'false'), ('30', '2025-09-11 09:15:39.648861+00', 'sodiq@annhurst-gsl.com', '123456', 'MOHAMMED SODIQ', null, '1990-07-08', '12345678901', '"{\"08080289082\"]}', '"{\"6, FOREST OFF IGBOEFON BUS STOP LEKKI\"]}', 'false', 'false'), ('31', '2025-09-11 09:16:58.633253+00', 'wasiu@annhurst-gsl.com', '123456', 'WASIU ADELEKE', null, '1990-11-25', '12345678901', '"{\"09122515577\"]}', '"{\"6, EJIO STREET, ODONLA, IKORODU, LAGOS\"]}', 'false', 'false'), ('32', '2025-09-11 09:18:40.75447+00', 'azeez@annhurst-gsl.com', '123456', 'IBRAHIM ABDULAZEEZ ALIU', null, '1990-04-24', '12345678901', '"{\"08037921475\"]}', '"{\"2, OYALEYE CLOSE, ALIMOSHO\"]}', 'false', 'false'), ('33', '2025-09-11 09:21:46.261591+00', 'ayandele@annhurst-gsl.com', '123456', 'AYANDELE YUSUF OLAREWAJU', null, '1990-11-06', '12345678901', '"{\"09071221212\"]}', '"{\"13, JIDE AWAWO STREET, OFF WAZOBIA BUS STOP, IKOTUN,LAGOS\"]}', 'false', 'false'), ('34', '2025-09-11 09:24:31.208827+00', 'sylvanus@annhurst-gsl.com', '123456', 'VICTOR SYLVANUS UMOH', null, '1990-11-12', '12345678901', '"{\"09016038311\"]}', '"{\"6, MUNIRU PAPA STREET, ALAGUNTAN, AJAH\"]}', 'false', 'false'), ('35', '2025-09-11 09:26:23.336297+00', 'hamzat@annhurst-gsl.com', '123456', 'HAMZAT IBRAHIM OLAMILEKAN', null, '1990-11-15', '12345678901', '"{\"08118209670\",\"08079750783\"]}', '"{\"5, ABULE PARAPO, OFF DEEPER LIFE, AWOYAYA, IBEJU LEKKI\"]}', 'false', 'false'), ('36', '2025-09-11 09:27:38.404745+00', 'okon@annhurst-gsl.com', '123456', 'EFFIONG ESSIEN OKON', null, '1990-08-05', '12345678901', '"{\"08023497731\"]}', '"{\"12, PEDRIS STREET, ILAJE, MOBIL ROAD, AJAH\"]}', 'false', 'false'), ('37', '2025-09-11 09:28:58.85844+00', 'bidemi@annhurst-gsl.com', '123456', 'OBIYELE TUNDE BIDEMI', null, '1990-09-27', '12345678901', '"{\"09035378114\"]}', '"{\"24, BASHORUN JUNCTION, IGBOGBO, IKORODU, LAGOS\"]}', 'false', 'false'), ('38', '2025-09-11 09:30:38.446211+00', 'kodi@annhurst-gsl.com', '123456', 'KODI DONALD', null, '1990-02-21', '12345678901', '"{\"08038160136\",\"07032151313\"]}', '"{\"48, OFFICE DEPOT, MAJEK, IBEJU LEKKI, LAGOS\"]}', 'false', 'false'), ('39', '2025-09-11 09:32:47.450069+00', 'ndimele@annhurst-gsl.com', '123456', 'NDIMELE PRECIOUS OLUCHI', null, '1990-04-26', '12345678901', '"{\"08069602794\"]}', '"{\"10, OSEREN KOJO GANDER STREET, OFF ADEBA BUS STOP, LAKOWE\"]}', 'false', 'false'), ('40', '2025-09-11 09:34:15.456389+00', 'okem@annhurst-gsl.com', '123456', 'DANIEL OKEM UGBEM', null, '1990-11-20', '12345678901', '"{\"08113401089\"]}', '"{\"2A, OKOAWO STREET, OPPOSITE EKO HOTEL, ROUNDABOUT, VI\"]}', 'false', 'false'), ('41', '2025-09-11 09:35:30.436382+00', 'alonge@annhurst-gsl.com', '123456', 'DARE JACOB ALONGE', null, '1990-11-26', '12345678901', '"{\"08062741343\"]}', '"{\"59, ADESAN ROAD, OFF MADAM POULTRY BUS STOP, MOWE, OGUN STATE\"]}', 'false', 'false'), ('42', '2025-09-11 09:36:58.493978+00', 'oshualale@annhurst-gsl.com', '123456', 'BASHIRU TAIWO OSHUALALE', null, '1990-06-13', '12345678901', '"{\"09125557316\"]}', '"{\"71, HAMMED STREET, MOPO AKINLADE, ABRAHAM ADESANYA\"]}', 'false', 'false'), ('43', '2025-09-11 09:39:50.045782+00', 'ege@annhurst-gsl.com', '123456', 'OLADIMEJI KAZEEM EGE', null, '1990-08-05', '12345678901', '"{\"09026787560\"]}', '"{\"4, LAYI YUSUF STREET, OFF ADMIRALTY WAY, LEKKI PHASE 1\"]}', 'false', 'false'), ('44', '2025-09-11 09:41:17.63241+00', 'sabo@annhurst-gsl.com', '123456', 'BENNY SABO FAVOUR SIMON', null, '1990-04-29', '12345678901', '"{\"07072805008\",\"09127226095\"]}', '"{\"1, PATRICK OKNJE, GBARADA NNPC BUS STOP, IBEJU LEKKI\"]}', 'false', 'false'), ('45', '2025-09-11 09:42:32.103006+00', 'godspower@annhurst-gsl.com', '123456', 'GODSPOWER SUNNY OGAGA', null, '1990-11-13', '12345678901', '"{\"08037027177\"]}', '"{\"1, AL-ITAJJAJ STREET, OFF PLANTINUM WAY, JAKANDE FIST GATE, LEKKI\"]}', 'false', 'false'), ('46', '2025-09-11 09:43:58.321082+00', 'osunjimi@annhurst-gsl.com', '123456', 'LAWRENCE ADEBAYO OSUNJIMI', null, '1990-09-02', '12345678901', '"{\"08036005363\"]}', '"{\"6, HOTEL STREET, IGBOJIYA ROAD, MOLETE TOWN, IBEJU LEKKI\"]}', 'false', 'false'), ('47', '2025-09-11 09:45:15.727552+00', 'ogunloye@annhurst-gsl.com', '123456', 'OLALEKAN WAHAB OGUNLOYE', null, '1990-11-20', '12345678901', '"{\"07061432081\"]}', '"{\"2, ORIKUTA STREET, OGIJO , IKORODU\"]}', 'false', 'false'), ('48', '2025-09-11 09:46:33.238764+00', 'oshati@annhurst-gsl.com', '123456', 'IMOLE EMMANUEL OSHATI', null, '1990-12-11', '12345678901', '"{\"09051310413\"]}', '"{\"3, VFC CLOSE, OFF STILL WATER, IKATE ELEGUSHI, LEKKI\"]}', 'false', 'false'), ('49', '2025-09-11 09:48:08.591923+00', 'tsunday@annhurst-gsl.com', '123456', 'EMMANUEL TUNDE SUNDAY', null, '1990-10-30', '12345678901', '"{\"08104391373\"]}', '"{\"BLOCK 15, FLAT 4, ROAD 401, ABRAHAM ADESANYA ESTATE, AJAH\"]}', 'false', 'false'), ('50', '2025-09-11 09:49:29.351979+00', 'adeniji@annhurst-gsl.com', '123456', 'ADEDEJI FEMI ADENIJI', null, '1990-12-11', '12345678901', '"{\"08127332045\"]}', '"{\"57, BAALE AYIETORO, OFF AYETORO BOUNDARY, AJEGUNLE, APAPA\"]}', 'false', 'false'), ('51', '2025-09-11 09:50:50.329894+00', 'etimothy@annhurst-gsl.com', '123456', 'EMMANUEL TIMOTHY', null, '1990-09-24', '12345678901', '"{\"09163294627\"]}', '"{\"23, ISALE IJEBU STREET, AJAH, LAGOS\"]}', 'false', 'false'), ('52', '2025-09-11 09:52:00.791059+00', 'aminat@annhurst-gsl.com', '123456', 'AMINAT OMOWUMI OYINLOLA', null, '1990-06-20', '12345678901', '"{\"09154606854\"]}', '"{\"24, IFA MOROTI STREET, ADDO ROAD, AJAH\"]}', 'false', 'false'), ('53', '2025-09-11 09:53:18.400229+00', 'ogar@annhurst-gsl.com', '123456', 'OGAR KELVIN OGBAJI', null, '1990-07-25', '12345678901', '"{\"07032933029\"]}', '"{\"51, ISALE IJEBU STREET, OFF ALESH HOTEL, AJAH\"]}', 'false', 'false'), ('54', '2025-09-11 09:54:21.932056+00', 'umoru@annhurst-gsl.com', '123456', 'ELIJAH JUNIOR UMORU', null, '1990-10-23', '12345678901', '"{\"07045419890\"]}', '"{\"13, JEHOVAH WITHNESS, OKOLOMI, OFF LEKKI EPE EXPRESS WAY, BOGIJE\"]}', 'false', 'false');

INSERT INTO "public"."coordinators" ("id", "created_at", "email", "password", "name", "avatar", "phone", "user_id", "banned") VALUES ('1', '2025-09-03 21:04:44+00', 'chuksmanny97@gmail.com', '123', 'Emmanuel', null, '"{\"09054257289\"]}', '8f05ba64-005d-4c56-b426-3badd4596c0f', 'false'), ('2', '2025-09-03 21:09:27+00', 'abisomukailaabiso@gmail.com', '123', 'Mukaila', null, '"{\"09063750685\"]}', '646ee4e2-f49f-4789-bb75-0bec72a64d60', 'false'), ('3', '2025-09-03 21:11:16+00', 'rolandogbaisi75@gmail.com', '123', 'Roland', null, '"{\"08122574825\"]}', 'd74e5de5-02e4-4bd1-9249-92ca931012f5', 'false'), ('4', '2025-09-03 21:12:50+00', 'cereoah@annhurst-gsl.com', '123', 'Cleophas', null, '"{\"07065226741\"]}', '1a145b44-0dc3-41d1-b024-36fbca710578', 'false');

INSERT INTO "public"."payment" ("id", "created_at", "week", "coordinator", "bus", "p_week", "receipt", "amount", "sender", "payment_day", "payment_date", "pay_type", "pay_complete", "issue", "inspection", "completed_by") VALUES 
('1', '2025-09-10 19:47:48.320545+00', '2025-09-08', 'Cleophas', '1', 'First', 'L07,N100000,06.09.2025,DR Receipt.PNG', '100000', 'Elizabeth Mary', 'SAT', '2025-09-06', 'ACCOUNT', 'YES', 'NO', 'YES', 'Cleophas'), 
('2', '2025-09-10 21:08:11.150383+00', '2025-09-08', 'Cleophas', '4', 'First', 'L08,N65000,08.09.2025,DR Receipt.PNG', '65000', 'Taiwo Tola Seun', 'MON', '2025-09-08', 'ACCOUNT', 'YES', 'Bus to be Repossessed', 'YES', 'Cleophas'), 
('3', '2025-09-12 17:11:12.749933+00', '2025-07-21', 'Emmanuel', '3', 'First', 'M01,N65000,20.07.2025,DR Receipt.jpg', '65000', 'OLADAYO SUNDAY ALAO', 'SUN', '2025-07-20', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('4', '2025-09-12 17:14:25.893182+00', '2025-07-28', 'Emmanuel', '3', 'First', 'M01,N28000,29.07.2025,DR Receipt.jpeg', '28000', 'OLADAYO SUNDAY ALAO', 'TUE', '2025-07-29', 'ACCOUNT', 'YES', 'Bus Down', 'YES', 'Emmanuel'), 
('5', '2025-09-12 17:17:31.774975+00', '2025-08-04', 'Emmanuel', '3', 'First', 'M01,N65000,03.08.2025,DR Receipt.pdf', '65000', 'M1 WEEK', 'SUN', '2025-08-03', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('6', '2025-09-12 17:20:49.346927+00', '2025-08-11', 'Emmanuel', '3', 'First', 'M01,N65000,10.09.2025,DR Receipt.pdf', '65000', 'M1 WEEK', 'SUN', '2025-08-10', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('7', '2025-09-12 17:24:20.437072+00', '2025-08-18', 'Emmanuel', '3', 'First', 'M01,N40000,17.08.2025,DR Receipt.pdf', '40000', 'M1 WEEK', 'SUN', '2025-08-17', 'ACCOUNT', 'NO', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('8', '2025-09-12 17:25:42.431135+00', '2025-08-18', 'Emmanuel', '3', 'Second', 'M01,N25000,18.08.2025,DR Receipt.pdf', '25000', 'M1 WEEK', 'MON', '2025-08-18', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('9', '2025-09-12 17:41:50.897095+00', '2025-08-25', 'Emmanuel', '3', 'First', 'M01,N65000,24.08.2025,DR Receipt.pdf', '65000', 'M1 WEEK', 'SUN', '2025-08-24', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('10', '2025-09-12 17:44:50.821564+00', '2025-09-01', 'Emmanuel', '3', 'First', 'M01,N65000,31.08.2025,DR Receipt.jpeg', '65000', 'M1 WEEK', 'SUN', '2025-08-31', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('11', '2025-09-12 17:47:09.09852+00', '2025-09-08', 'Emmanuel', '3', 'First', 'M01,N65000,08.09.2025,DR Receipt.pdf', '65000', 'OLADAYO SUNDAY ALAO', 'SUN', '2025-09-08', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('12', '2025-09-29 17:25:55.761494+00', '2025-09-29', 'Emmanuel', '43', 'First', 'M04,N65000,28.09.2025,DR Receipt.jpeg', '65000', 'OSUOLALE TAIWO BASIRU', 'SUN', '2025-09-28', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('13', '2025-09-29 18:44:44.271885+00', '2025-09-22', 'Emmanuel', '15', 'First', 'K09,N60000,22.09.2025,DR Receipt.pdf', '60000', 'DAMOLA MUMEEN SHOWOBI', 'MON', '2025-09-22', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('14', '2025-09-29 19:17:18.184445+00', '2025-09-29', 'Emmanuel', '49', 'First', 'M10,N65000,29.09.2025,DR Receipt.jpg', '65000', 'EMMANUEL IMOLE OSHATI', 'MON', '2025-09-29', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel'), 
('15', '2025-09-29 19:26:09.226974+00', '2025-09-29', 'Emmanuel', '23', 'Second', 'K17,N20000,28.09.2025,DR Receipt.jpeg', '20000', 'OLAOYE OLADEJI', 'SUN', '2025-09-28', 'ACCOUNT', 'YES', 'N/A - No Issues Collecting Money', 'YES', 'Emmanuel');

INSERT INTO "public"."buses" ("id", "created_at", "bus_code", "driver", "letter", "e_payment", "contract_date", "agreed_date", "date_collected", "start_date", "first_pay", "initial_owe", "deposited", "t_income", "plate_no", "coordinator") VALUES 
('1', '2025-09-03 15:53:51+00', 'L07', '3', 'false', '60000', '2025-04-07', '2027-01-03', '2025-04-12', '2025-04-14', '2025-04-20', '5600000', '250000', '2350000', 'KTU 724 YK', '4'), 
('3', '2025-09-03 16:40:53+00', 'M01', '2', 'false', '65000', '2025-06-20', '2027-03-14', '2025-07-11', '2025-07-14', '2025-07-20', '5863000', '300000', '783000', 'KTU 211 YL', '1'), 
('4', '2025-09-03 16:46:19+00', 'L08', '1', 'false', '60000', '2025-04-07', '2027-01-03', '2025-04-12', '2025-04-14', '2025-04-20', '5600000', '250000', '1685000', 'KTU 725 YK', '4'), 
('5', '2025-09-09 19:14:12.828486+00', 'TR', '5', 'false', '50000', '2023-08-28', '2024-12-29', '2023-08-30', '2023-08-28', '2023-09-10', '3500000', '100000', '2825000', 'GGE 257 YH', '2'), 
('6', '2025-09-09 19:15:53.034765+00', 'I03', '4', 'false', '50000', '2024-10-04', '2025-11-30', '2024-10-04', '2024-10-13', '2024-11-03', '2400000', '0', '1820000', 'GGE 413 YH', '4'), 
('7', '2025-09-09 20:23:13.234599+00', 'J03', '6', 'false', '50000', '2025-02-17', '2025-12-07', '2025-02-18', '2025-02-27', '2025-03-02', '2000000', '0', '1350000', 'KRD 464 YH', '4'), 
('8', '2025-09-09 20:24:14.559983+00', 'J09', '7', 'false', '40000', '2024-10-05', '2026-07-03', '2024-08-26', '2024-08-26', '2024-09-01', '2000000', '0', '1845000', 'FST 212YH', '3'), 
('9', '2025-09-09 20:25:44.945142+00', 'K02', '8', 'false', '40000', '2024-10-04', '2026-01-11', '2024-10-04', '2024-10-13', '2024-10-20', '2670000', '100000', '1940000', 'LSD 536 YJ', '1'), 
('10', '2025-09-09 20:26:21.503686+00', 'K04', '9', 'false', '50000', '2025-05-08', '2026-03-12', '2025-05-10', '2025-05-25', '2025-05-25', '2000000', '0', '800000', 'EKY 410YJ', '1'), 
('11', '2025-09-09 20:27:04.019718+00', 'K05', '10', 'false', '50000', '2025-05-11', '2026-03-23', '2025-05-11', '2025-05-18', '2025-05-19', '2300000', '0', '800000', 'LSD 537 YJ', '3'), 
('12', '2025-09-09 20:27:39.227802+00', 'K06', '11', 'false', '50000', '2024-01-31', '2025-10-26', '2024-02-02', '2024-02-05', '2024-02-10', '3700000', '150000', '3430000', 'LSD 882YJ', '1'), 
('13', '2025-09-09 20:28:16.693386+00', 'K07', '12', 'false', '50000', '2025-01-13', '2025-11-16', '2025-01-21', '2025-01-26', '2025-02-03', '2200000', '100000', '1700000', 'LSD 881YJ', '1'), 
('14', '2025-09-09 20:28:58.421118+00', 'K08', '13', 'true', '70000', '2025-02-07', '2025-12-07', '2025-02-07', '2025-02-10', '2025-02-23', '2200000', '100000', '1520000', 'FKJ 142YJ', '4'), 
('15', '2025-09-09 20:29:29.30857+00', 'K09', '14', 'true', '60000', '2024-01-25', '2025-11-09', '2024-02-19', '2024-02-19', '2024-02-26', '3700000', '150000', '3390000', 'FKJ 141YJ', '1'), 
('16', '2025-09-09 20:30:06.35824+00', 'K10', '15', 'false', '40000', '2024-03-08', '2025-12-07', '2024-03-11', '2024-03-12', '2024-03-17', '3700000', '125000', '3235000', 'FST 576YJ', '4'), 
('17', '2025-09-09 20:30:40.627265+00', 'K11', '16', 'true', '55000', '2024-03-11', '2025-12-14', '2024-03-11', '2024-03-12', '2024-03-18', '3700000', '125000', '3219000', 'FST 579YJ', '1'), 
('18', '2025-09-09 20:31:07.618633+00', 'K12', '17', 'true', '80000', '2025-02-07', '2025-12-07', '2025-02-07', '2025-02-10', '2025-02-17', '2200000', '100000', '1500000', 'FST 578YJ', '3'), 
('19', '2025-09-09 20:31:40.229398+00', 'K13', '18', 'false', '40000', '2024-03-09', '2025-11-16', '2024-03-09', '2024-03-11', '2024-03-17', '3600000', '150000', '3270000', 'FST 581YJ', '3'), 
('20', '2025-09-11 10:01:04.332924+00', 'K14', '19', 'true', '50000', '2024-03-09', '2025-11-16', '2024-03-09', '2024-03-11', '2024-03-18', '3600000', '150000', '3220000', 'FST 580YJ', '1'), 
('21', '2025-09-11 10:35:29.016175+00', 'K15', '20', 'false', '50000', '2025-01-23', '2025-12-21', '2025-01-27', '2025-02-03', '2025-02-10', '2600000', '100000', '1600000', 'FST 686YJ', '1'), 
('22', '2025-09-11 10:54:44.876506+00', 'K16', '21', 'false', '50000', '2024-03-01', '2025-12-21', '2024-04-05', '2024-04-08', '2024-04-15', '3600000', '150000', '3090000', 'FST 685YJ', '1'), 
('23', '2025-09-11 11:02:00.295453+00', 'K17', '22', 'false', '40000', '2024-04-19', '2026-01-18', '2024-04-23', '2024-04-24', '2024-04-29', '3700000', '150000', '3045000', 'AGL 52YJ', '1'), 
('24', '2025-09-11 11:05:54.392229+00', 'K18', '23', 'false', '40000', '2024-04-19', '2026-01-04', '2024-04-24', '2024-04-25', '2024-04-29', '3600000', '150000', '2765000', 'AGL 50YJ', '1'), 
('25', '2025-09-11 11:09:33.036853+00', 'L01', '24', 'false', '60000', '2025-02-13', '2026-11-22', '2025-02-14', '2025-02-17', '2025-02-23', '5700000', '250000', '1990000', 'MUS 950YH', '4'), 
('26', '2025-09-11 11:12:16.921415+00', 'L02', '25', 'false', '60000', '2025-02-09', '2026-11-15', '2025-02-09', '2025-02-10', '2025-02-15', '5600000', '249999', '2050000', 'MUS 949YH', '3'), 
('27', '2025-09-11 11:15:15.837171+00', 'L03', '26', 'false', '60000', '2025-03-03', '2026-12-20', '2025-03-13', '2025-03-17', '2025-03-23', '5700000', '250000', '1750000', 'KTU 720YK', '3'), 
('28', '2025-09-11 11:17:55.761468+00', 'L04', '27', 'false', '60000', '2025-02-14', '2026-12-09', '2025-03-14', '2025-02-17', '2025-03-23', '5600000', '250000', '1750000', 'KTU 721YK', '4'), 
('29', '2025-09-11 11:25:51.917493+00', 'L05', '28', 'false', '60000', '2025-03-03', '2026-12-20', '2025-03-14', '2025-03-17', '2025-03-23', '5700000', '250000', '1750000', 'KTU 722YK', '3'), 
('30', '2025-09-11 11:29:16.222978+00', 'L06', '29', 'false', '60000', '2025-03-03', '2026-12-09', '2025-03-14', '2025-02-17', '2025-03-23', '5600000', '250000', '1750000', 'KTU 723YK', '3'), 
('31', '2025-09-11 11:33:49.639145+00', 'L09', '30', 'false', '60000', '2025-03-03', '2026-12-20', '2025-03-14', '2025-03-17', '2025-03-23', '5700000', '250000', '1570000', 'SMK 834YK', '3'), 
('32', '2025-09-11 11:37:14.598275+00', 'L10', '31', 'false', '60000', '2025-03-03', '2027-03-07', '2025-06-01', '2025-03-16', '2025-06-08', '5700000', '250000', '1070000', 'KRD 741 YL', '3'), 
('33', '2025-09-11 11:39:56.306258+00', 'L11', '32', 'false', '60000', '2025-03-03', '2027-03-07', '2025-05-31', '2025-06-02', '2025-06-08', '5700000', '250000', '1070000', 'EKY 427 YL', '3'), 
('34', '2025-09-11 11:44:27.049009+00', 'L12', '33', 'false', '60000', '2025-05-04', '2027-03-07', '2025-05-31', '2025-06-02', '2025-06-08', '5700000', '250000', '1070000', 'KRD 740 YL', '3'), 
('35', '2025-09-11 11:54:49.701549+00', 'L13', '34', 'false', '60000', '2025-03-30', '2027-03-07', '2025-03-31', '2025-06-02', '2025-06-08', '5700000', '250000', '1070000', 'EKY 428 YL', '4'), 
('36', '2025-09-11 11:57:58.259216+00', 'L14', '35', 'false', '60000', '2025-05-25', '2027-03-07', '2025-05-31', '2025-06-02', '2025-06-08', '5700000', '250000', '1070000', 'KRD 742 YL', '4'), 
('37', '2025-09-11 12:16:24.549921+00', 'L15', '36', 'false', '65000', '2025-06-01', '2027-02-07', '2025-06-01', '2025-06-02', '2025-06-26', '5900000', '400000', '1090000', 'KRD 739 YL', '4'), 
('38', '2025-09-11 12:20:39.390789+00', 'L16', '37', 'false', '60000', '2025-05-31', '2027-02-21', '2025-05-31', '2025-06-02', '2025-06-08', '5600000', '250000', '1070000', 'KRD 743 YL', '3'), 
('39', '2025-09-11 12:24:54.033635+00', 'L17', '38', 'false', '60000', '2025-05-31', '2027-02-21', '2025-06-02', '2025-06-02', '2025-06-08', '5600000', '250000', '1070000', 'KRD 744 YL', '4'), 
('40', '2025-09-11 12:27:30.614012+00', 'L18', '39', 'false', '65000', '2025-05-31', '2027-01-31', '2025-06-01', '2025-06-02', '2025-06-08', '5900000', '300000', '1185000', 'EKY 429 YL', '4'), 
('41', '2025-09-11 12:30:30.753594+00', 'M02', '40', 'false', '65000', '2025-06-13', '2027-03-21', '2025-07-11', '2025-07-14', '2025-07-20', '6000000', '300000', '845000', 'KTU 213 YL', '1'), 
('42', '2025-09-11 12:32:46.532898+00', 'M03', '41', 'false', '65000', '2025-06-26', '2027-04-11', '2025-08-01', '2025-08-04', null, '6000000', '300000', '625000', 'AKD 885 YL', '3'), 
('43', '2025-09-12 09:19:55.289516+00', 'M04', '42', 'false', '65000', '2025-06-05', '2027-03-21', '2025-07-14', '2025-07-14', '2025-07-18', '6000000', '300000', '820000', 'KTU 210 YL', '1'), 
('44', '2025-09-12 09:22:19.542034+00', 'M05', '43', 'false', '65000', '2025-06-04', '2027-04-11', '2025-07-26', '2025-07-28', '2025-08-03', '6000000', '300000', '665000', 'KTU 172 YL', '3'), 
('45', '2025-09-12 09:25:06.916746+00', 'M06', '44', 'false', '65000', '2025-03-27', '2027-03-28', '2025-07-26', '2025-07-28', '2025-07-20', '6000000', '300000', '795000', 'KTU 209 YL', '3'), 
('46', '2025-09-12 09:27:34.998531+00', 'M07', '45', 'false', '65000', '2025-06-30', '2027-03-28', '2025-07-26', '2025-07-28', '2025-08-02', '6000000', '300000', '665000', 'KTU 173 YL', '3'), 
('47', '2025-09-12 09:29:51.297426+00', 'M08', '46', 'false', '65000', '2025-06-23', '2027-04-11', '2025-07-26', '2025-07-28', '2025-08-02', '6000000', '300000', '665000', 'KTU 171 YL', '4'), 
('48', '2025-09-12 09:32:39.188793+00', 'M09', '47', 'false', '65000', '2025-06-23', '2027-04-11', '2025-07-26', '2025-07-28', '2025-08-01', '6000000', '300000', '665000', 'KTU 144 YL', '4'), 
('49', '2025-09-12 09:35:40.459571+00', 'M10', '48', 'false', '65000', '2025-06-04', '2027-03-14', '2025-07-11', '2025-07-14', '2025-07-20', '5900000', '300000', '820000', 'KTU 212 YL', '1'), 
('50', '2025-09-12 09:37:41.955274+00', 'M11', '49', 'false', '65000', '2025-07-02', '2027-04-04', '2025-08-01', '2025-08-04', '2025-08-10', '5900000', '300000', '625000', 'AKD 887 YL', '4'), 
('51', '2025-09-12 09:40:26.614582+00', 'M12', '50', 'false', '65000', '2025-06-30', '2027-08-09', '2025-08-30', '2025-09-07', '2025-09-07', '6000000', '300000', '365000', 'AKD 276 YL', '4'), 
('52', '2025-09-12 09:42:48.168187+00', 'M13', '51', 'false', '65000', '2025-06-30', '2027-03-28', '2025-07-26', '2025-07-28', '2025-08-03', '5900000', '300000', '665000', 'KTU 170 YL', '4'), 
('53', '2025-09-12 09:44:43.496694+00', 'M15', '52', 'false', '65000', '2025-07-21', '2027-04-11', '2025-08-01', '2025-08-04', '2025-08-10', '6000000', '300000', '625000', 'AKD 886 YL', '3'), 
('54', '2025-09-12 09:49:55.072157+00', 'M17', '53', 'false', '65000', '2025-07-07', '2027-05-09', '2025-08-31', '2025-09-01', '2025-09-08', '5900000', '300000', '355000', 'AKD 278 YL', '1'), 
('55', '2025-09-12 09:52:25.755547+00', 'M18', '54', 'false', '65000', '2025-06-20', '2027-03-28', '2025-07-26', '2025-07-28', '2025-09-03', '5900000', '300000', '665000', 'KTU 169 YL', '1'), 
('56', '2025-10-09 11:41:54.407076+00', 'N04', '57', 'false', '65000', '2025-09-30', '2027-02-04', '2025-09-27', '2025-09-28', '2025-10-05', '6500000', '300000', '365000', 'AKD 922 YL', '4'), 
('57', '2025-10-10 12:36:53.100984+00', 'N01', '55', 'false', '65000', '2025-09-12', '2027-03-05', '2025-08-30', '2025-09-07', '2025-10-05', '6000000', '300000', '3650000', 'AKD 235 YL', '4'), 
('58', '2025-10-10 12:41:36.363819+00', 'N02', '56', 'false', '65000', '2025-08-23', '2027-03-05', '2025-08-30', '2025-09-07', '2025-10-05', '6500000', '300000', '0', 'AKD 913 YL', '3'), 
('59', '2025-10-10 12:44:45.303126+00', 'N07', '58', 'false', '65000', '2025-08-23', '2027-05-03', '2025-08-30', '2025-09-07', '2025-10-05', '6000000', '65000', '365000', 'AKD 249 YL', '1'), 
('60', '2025-10-10 12:49:03.72093+00', 'N13', '59', 'false', '65000', '2025-09-27', '2027-03-03', '2025-08-30', '2025-09-07', '2025-10-05', '6000000', '299999', '365000', 'AKD 930 YL', '4'), 
('61', '2025-10-10 12:53:23.968345+00', 'N15', '60', 'false', '65000', '2025-08-30', '2027-02-07', '2025-08-30', '2025-09-07', '2025-09-07', '6000000', '300000', '699000', 'AKD 277 YL', '3');