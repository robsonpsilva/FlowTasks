INSERT INTO public.auth_providers (name) VALUES ('Google'), ('Email/Senha');

INSERT INTO public.categories (name, description) 
VALUES ('Home', 'Household chores'), ('Work', 'Professional demands'), ('School', 'School assignments'), ('Personal', 'Personal activities');

INSERT INTO public.roles (name, description) VALUES ('Member', 'Standard user'),('Admin', 'System manager');

INSERT INTO public.users (name, email, provider_id) 
VALUES ('Robson Paulo da Silva', 'robson_p_s@yahoo.com.br', 2) 
--RETURNING id; -- Suponhamos que o ID retornado seja 1

INSERT INTO public.roles_users (users_id, roles_id) VALUES (1, 2);
-- First User andRole = "Admin"

INSERT INTO public.tasks (title, description, category_id, priority, status)
VALUES ('Clean the kitchen', 'Clean the dishes anf wipe', 1, 'HIGH', 'PENDING')
--RETURNING id;

-- 1. Linking the owner to the task.
INSERT INTO public.tasks_users (tasks_id, users_id) VALUES (1, 1);

--Create the repetition rule (Every Tuesday and Thursday)

INSERT INTO public.task_schedules (task_id, frequency, days_of_week, start_date)
VALUES (1, 'WEEKLY', ARRAY[2, 4], CURRENT_TIMESTAMP);

--Create a specific instance for the calendar.
INSERT INTO public.task_instances (task_id, scheduled_date, status)
VALUES (1, '2026-03-17', 'PENDING');