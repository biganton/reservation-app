create sequence S_CUSTOMERS
/

create sequence S_RESERVATIONS
/

create sequence S_LOGS
/

create sequence S_TABLES
/

create sequence S_TYPES
/

create or replace type available_tables as OBJECT
(
    table_type_name varchar2(50)
)
/

create or replace type customer_reservation_info as object (
    reservation_id int,
    table_id int,
    table_type varchar2(50),
    start_date date,
    end_date date,
    no_guests int,
    status char(1),
    notes varchar2(255)
)
/

create or replace type customer_details as object (
    firstname varchar2(50),
    lastname varchar2(50),
    phone_number varchar2(20),
    email varchar2(100)
)
/

create or replace TYPE AVAILABLE_TABLE_TYPES AS OBJECT
(
    table_type_id INT
)
/

create or replace TYPE first_TABLE_by_TYPE AS OBJECT
(
    table_id Number
)
/

create type AVAILABLE_TABLES_TABLE as table of AVAILABLE_TABLES
/

create type CUSTOMER_RESERVATION_INFO_TABLE as table of CUSTOMER_RESERVATION_INFO
/

create type CUSTOMER_DETAILS_TABLE as table of CUSTOMER_DETAILS
/

create type AVAILABLE_TABLE_TYPES_TABLE as table of AVAILABLE_TABLE_TYPES
/

create type FIRST_TABLE_BY_TYPE_TABLE as table of FIRST_TABLE_BY_TYPE
/

create table CUSTOMERS
(
    CUSTOMER_ID  NUMBER default "BD_415123"."S_CUSTOMERS"."NEXTVAL" not null
        primary key,
    FIRSTNAME    VARCHAR2(50),
    LASTNAME     VARCHAR2(50),
    PHONE_NUMBER VARCHAR2(20)
        constraint UNIQUE_PHONE_NUMBER
            unique
        constraint PHONE_NUMBER_FORMAT
            check (REGEXP_LIKE(phone_number, '^[0-9]{9}$')),
    EMAIL        VARCHAR2(100)
)
/

create or replace trigger TRG_DELETE_CUSTOMER
    before delete
    on CUSTOMERS
    for each row
BEGIN
   RAISE_APPLICATION_ERROR(-20001, 'Deleting customers is not allowed.');
END;
/

create table TABLE_TYPES
(
    TYPE_ID   NUMBER default "BD_415123"."S_TYPES"."NEXTVAL" not null
        primary key,
    TYPE_NAME VARCHAR2(50)                                   not null
)
/

create table TABLES
(
    TABLE_ID      NUMBER default "BD_415123"."S_TABLES"."NEXTVAL" not null
        primary key,
    NO_SEATS      NUMBER,
    TABLE_TYPE_ID NUMBER
        constraint FK_TABLE_TYPE
            references TABLE_TYPES
)
/

create or replace trigger TRG_DELETE_TABLE
    before delete
    on TABLES
    for each row
BEGIN
   RAISE_APPLICATION_ERROR(-20001, 'Deleting tables is not allowed.');
END;
/

create table RESERVATIONS
(
    RESERVATION_ID NUMBER default "BD_415123"."S_RESERVATIONS"."NEXTVAL" not null
        primary key,
    TABLE_ID       NUMBER
        references TABLES,
    CUSTOMER_ID    NUMBER
        references CUSTOMERS,
    START_DATE     TIMESTAMP(6),
    END_DATE       TIMESTAMP(6),
    NO_GUESTS      NUMBER,
    STATUS         CHAR
        check (status IN ('N', 'P', 'C')),
    NOTES          VARCHAR2(255)
)
/

create or replace trigger TRG_DELETE_RESERVATION
    before delete
    on RESERVATIONS
    for each row
BEGIN
   RAISE_APPLICATION_ERROR(-20001, 'Deleting reservations is not allowed.');
END;
/

create or replace trigger TRG_LOG_ADD_RESERVATION
    after insert
    on RESERVATIONS
    for each row
BEGIN
   INSERT INTO LOG (RESERVATION_ID, LOG_DATE, STATUS)
   VALUES (:NEW.RESERVATION_ID, SYSDATE, 'N');
END;
/

create or replace trigger TRG_LOG_CHANGE_RESERVATION_STATUS
    after update of STATUS
    on RESERVATIONS
    for each row
BEGIN
   INSERT INTO LOG (RESERVATION_ID, LOG_DATE, STATUS)
   VALUES (:NEW.RESERVATION_ID, SYSDATE, :NEW.STATUS);
END;
/

create or replace trigger TRG_BEFORE_INSERT_RESERVATION
    before insert
    on RESERVATIONS
    for each row
DECLARE
    v_existing_reservations NUMBER;
BEGIN
    SELECT COUNT(*)
    INTO v_existing_reservations
    FROM RESERVATIONS
    WHERE TABLE_ID = :NEW.TABLE_ID
    AND (
        (START_DATE BETWEEN :NEW.START_DATE AND :NEW.END_DATE)
        OR (END_DATE BETWEEN :NEW.START_DATE AND :NEW.END_DATE)
        OR (:NEW.START_DATE BETWEEN START_DATE AND END_DATE)
        OR (:NEW.END_DATE BETWEEN START_DATE AND END_DATE)
    );

    IF v_existing_reservations > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'There is already a reservation for the selected table at the given time.');
    END IF;

END;
/

create or replace trigger TRG_BEFORE_CHANGE_RESERVATION_STATUS
    instead of update of STATUS
    on RESERVATIONS
    for each row
    COMPOUND TRIGGER
TYPE t_reservation IS TABLE OF reservations%ROWTYPE INDEX BY PLS_INTEGER;
v_reservations t_reservation;
BEFORE STATEMENT
IS BEGIN
    v_reservations.DELETE;
END BEFORE STATEMENT;
BEFORE EACH ROW
IS
BEGIN
    IF :NEW.status != 'C' AND :OLD.status = 'C' THEN
        v_reservations(v_reservations.COUNT + 1).START_DATE := :NEW.START_DATE;
        v_reservations(v_reservations.COUNT).END_DATE := :NEW.END_DATE;
        v_reservations(v_reservations.COUNT).reservation_id := :NEW.reservation_id;
    END IF;
END BEFORE EACH ROW;
AFTER STATEMENT
IS
    v_other_reservation INT;
BEGIN
    FOR i IN 1 .. v_reservations.COUNT LOOP
        SELECT COUNT(*)
        INTO v_other_reservation
        FROM RESERVATIONS r
        WHERE r.TABLE_ID = v_reservations(i).table_id
        AND (
            (r.START_DATE BETWEEN v_reservations(i).start_date AND v_reservations(i).end_date)
            OR (r.END_DATE BETWEEN v_reservations(i).start_date AND v_reservations(i).end_date)
            OR ((v_reservations(i).start_date BETWEEN r.START_DATE AND r.END_DATE) AND (v_reservations(i).end_date BETWEEN r.START_DATE AND r.END_DATE))
        );

        IF v_other_reservation > 0 THEN
            RAISE_APPLICATION_ERROR(-20001, 'Another reservation exists for the same table and overlapping time slot.');
        END IF;
    END LOOP;
END AFTER STATEMENT;
END trg_before_change_reservation_status;
/

create table LOG
(
    LOG_ID         NUMBER default "BD_415123"."S_LOGS"."NEXTVAL" not null
        primary key,
    RESERVATION_ID NUMBER
        references RESERVATIONS,
    LOG_DATE       TIMESTAMP(6),
    STATUS         CHAR
        check (status IN ('N', 'P', 'C'))
)
/

create or replace trigger TRG_DELETE_LOG
    before delete
    on LOG
    for each row
BEGIN
   RAISE_APPLICATION_ERROR(-20001, 'Deleting logs is not allowed.');
END;
/

create or replace trigger TRG_DELETE_TYPE
    before delete
    on TABLE_TYPES
    for each row
BEGIN
   RAISE_APPLICATION_ERROR(-20001, 'Deleting types is not allowed.');
END;
/

create or replace view VW_ALL_RESERVATIONS as
SELECT r.RESERVATION_ID, c.FIRSTNAME || ' ' || c.LASTNAME AS CUSTOMER_NAME,
       r.TABLE_ID, r.START_DATE, r.END_DATE, r.NO_GUESTS, r.STATUS, r.NOTES
FROM RESERVATIONS r
JOIN TABLES t ON r.TABLE_ID = t.TABLE_ID
JOIN CUSTOMERS c ON r.CUSTOMER_ID = c.CUSTOMER_ID
/

create or replace view VV_CURRENT_CUSTOMERS_NO as
SELECT COUNT(*) AS CURRENT_CUSTOMERS_NO
FROM RESERVATIONS r
WHERE r.STATUS = 'P' -- Assuming 'P' denotes confirmed reservations
AND r.START_DATE <= SYSDATE
AND r.END_DATE >= SYSDATE
/

create or replace view VW_TODAY_RESERVATIONS as
SELECT "RESERVATION_ID","CUSTOMER_NAME","TABLE_ID","START_DATE","END_DATE","NO_GUESTS","STATUS","NOTES"
FROM VW_ALL_RESERVATIONS
WHERE TRUNC(start_date) = TRUNC(SYSDATE)
/

create or replace view VIEW_TABLE_UTILIZATION as
WITH ReservationDuration AS (
    SELECT
        TABLE_ID,
        SUM(EXTRACT(HOUR FROM (END_DATE - START_DATE)) * 60 + EXTRACT(MINUTE FROM (END_DATE - START_DATE))) AS total_minutes_reserved
    FROM
        RESERVATIONS
    GROUP BY
        TABLE_ID
)
SELECT
    T.TABLE_ID,
    T.NO_SEATS,
    TT.TYPE_NAME,
    NVL(RD.total_minutes_reserved, 0) AS total_minutes_reserved,
    ROUND((NVL(RD.total_minutes_reserved, 0) / (480 * 30)) * 100, 2) AS utilization_percentage -- assuming a 30-day month
FROM
    TABLES T
JOIN
    TABLE_TYPES TT ON T.TABLE_TYPE_ID = TT.TYPE_ID
LEFT JOIN
    ReservationDuration RD ON T.TABLE_ID = RD.TABLE_ID
ORDER BY
    utilization_percentage DESC
/

create or replace PROCEDURE p_customer_exist (
   c_id IN CUSTOMERS.CUSTOMER_ID%TYPE
) AS
   tmp CHAR(1);
BEGIN
   SELECT '1' INTO tmp FROM CUSTOMERS c WHERE c.CUSTOMER_ID = c_id;
EXCEPTION
   WHEN NO_DATA_FOUND THEN
       RAISE_APPLICATION_ERROR(-20001, 'Customer not found');
END p_customer_exist;
/

create or replace PROCEDURE p_table_exist (
   t_id IN TABLES.TABLE_ID%TYPE
) AS
   tmp CHAR(1);
BEGIN
   SELECT '1' INTO tmp FROM TABLES t WHERE t.TABLE_ID = t_id;
EXCEPTION
   WHEN NO_DATA_FOUND THEN
       RAISE_APPLICATION_ERROR(-20002, 'Table not found');
END p_table_exist;
/

create or replace PROCEDURE p_reservation_exist (
   r_id IN RESERVATIONS.RESERVATION_ID%TYPE
) AS
   tmp CHAR(1);
BEGIN
   SELECT '1' INTO tmp FROM RESERVATIONS r WHERE r.RESERVATION_ID = r_id;
EXCEPTION
   WHEN NO_DATA_FOUND THEN
       RAISE_APPLICATION_ERROR(-20003, 'Reservation not found');
END p_reservation_exist;
/

create or replace PROCEDURE p_type_exist (
   t_id IN TABLE_TYPES.TYPE_ID%TYPE
) AS
   tmp CHAR(1);
BEGIN
   SELECT '1' INTO tmp FROM TABLE_TYPES t WHERE t.TYPE_ID = t_id;
EXCEPTION
   WHEN NO_DATA_FOUND THEN
       RAISE_APPLICATION_ERROR(-20003, 'Type not found');
END p_type_exist;
/

create or replace PROCEDURE p_add_table (
    p_no_seats IN TABLES.NO_SEATS%TYPE,
    p_table_type IN TABLES.TABLE_TYPE_ID%TYPE
) AS
BEGIN
    P_TYPE_EXIST(p_table_type);

    INSERT INTO TABLES (NO_SEATS, TABLE_TYPE_ID)
    VALUES (p_no_seats, p_table_type);
    COMMIT;
END p_add_table;
/

create or replace PROCEDURE p_edit_table (
    p_table_id IN TABLES.TABLE_ID%TYPE,
    p_new_seats_no IN TABLES.NO_SEATS%TYPE
) AS
BEGIN
     P_TABLE_EXIST(p_table_id);

    UPDATE TABLES
    SET NO_SEATS = p_new_seats_no
    WHERE TABLE_ID = p_table_id;
    COMMIT;
END p_edit_table;
/

create or replace PROCEDURE p_add_reservation (
    p_table_id IN RESERVATIONS.TABLE_ID%TYPE,
    p_customer_id IN RESERVATIONS.CUSTOMER_ID%TYPE,
    p_date_start IN date,
    p_date_end IN date,
    p_no_guests IN RESERVATIONS.NO_GUESTS%TYPE,
    p_notes IN RESERVATIONS.NOTES%TYPE
) AS
    p_status char;
    v_seats_no int;
BEGIN
    P_TABLE_EXIST(p_table_id);
    P_CUSTOMER_EXIST(p_customer_id);

    SELECT NO_SEATS INTO v_seats_no FROM TABLES WHERE TABLE_ID = p_table_id;

    if p_no_guests > v_seats_no then
        raise_application_error(-20001, 'Too much guests for this table');
    end if;
    if p_date_start <= CURRENT_DATE then
        raise_application_error(-20001, 'Choose future date');
    end if;

    if p_date_start > CURRENT_DATE and p_no_guests <= v_seats_no then
            p_status := 'N';
            INSERT INTO RESERVATIONS (TABLE_ID, CUSTOMER_ID, START_DATE, END_DATE, NO_GUESTS,STATUS, NOTES)
            VALUES (p_table_id, p_customer_id, p_date_start, p_date_end, p_no_guests, p_status, p_notes);
    end if;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Reservation added successfully.');
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: Unable to add reservation.');

END p_add_reservation;
/

create or replace PROCEDURE p_modify_reservation_status (p_reservation_id INT, p_new_status CHAR)
AS
    v_current_status char;
BEGIN
    P_RESERVATION_EXIST(p_reservation_id);

    select status into v_current_status
    from reservations
    where reservation_id = p_reservation_id;
    if v_current_status = p_new_status then
    raise_application_error(-20001, 'The reservation already has the requested status.');
    end if;

    if p_new_status = 'C' or p_new_status = 'N' or p_new_status = 'P' then
        UPDATE reservations
        SET status = p_new_status
        WHERE reservation_id = p_reservation_id;
    end if;
    COMMIT;
    EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;

END;
/

create or replace FUNCTION f_tables_availability_hours(
    p_start_date DATE,
    p_end_date DATE,
    p_guests_no int
) RETURN AVAILABLE_TABLES_TABLE
AS
    result AVAILABLE_TABLES_TABLE;
BEGIN
    SELECT AVAILABLE_TABLES(tt.TYPE_name)
    BULK COLLECT INTO result
    FROM tables t
    join TABLE_TYPES tt on t.TABLE_TYPE_ID = tt.TYPE_ID
    WHERE t.table_id NOT IN (
        SELECT r.table_id
        FROM reservations r
        WHERE (r.start_date BETWEEN p_start_date AND p_start_date)
           OR (r.end_date BETWEEN p_start_date AND p_end_date)
           OR (r.start_date <= p_start_date AND r.end_date >= p_end_date)
    )
    AND (p_guests_no = t.NO_SEATS or p_guests_no+1 = t.NO_SEATS)
    group by tt.TYPE_name;
    RETURN result;
END;
/

create or replace function f_customer_reservation_history(customer_id int)
    return customer_reservation_info_table
as
    result customer_reservation_info_table;
begin
    p_customer_exist(customer_id);

    select customer_reservation_info(r.reservation_id, r.table_id, tt.type_name, r.start_date, r.end_date, r.no_guests, r.status, r.notes)
    bulk collect into result
    from reservations r
    join tables t on r.table_id = t.table_id
    join table_types tt on t.table_type_id = tt.type_id
    where r.customer_id = f_customer_reservation_history.customer_id;

    return result;
end;
/

create or replace PROCEDURE p_add_customer(
    p_firstname IN VARCHAR2,
    p_lastname IN VARCHAR2,
    p_phone_number IN VARCHAR2,
    p_email IN VARCHAR2
)
AS
    v_count INT;
BEGIN
    DBMS_OUTPUT.ENABLE;

    SELECT COUNT(*)
    INTO v_count
    FROM customers c
    WHERE c.phone_number = p_phone_number;

    IF v_count > 0 THEN
        DBMS_OUTPUT.PUT_LINE('Error: Customer with this phone number already exists.');
    ELSE

        INSERT INTO customers (firstname, lastname, phone_number, email)
        VALUES (p_firstname, p_lastname, p_phone_number, p_email);

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Customer added successfully.');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: Unable to add customer.');
END p_add_customer;
/

create or replace PROCEDURE p_phone_number_exist (
   phone_number IN customers.phone_number%TYPE
) AS
   tmp CHAR(1);
BEGIN
   SELECT '1' INTO tmp FROM customers c WHERE c.phone_number = p_phone_number_exist.phone_number;
EXCEPTION
   WHEN NO_DATA_FOUND THEN
       RAISE_APPLICATION_ERROR(-20003, 'Phone number not found');
END p_phone_number_exist;
/

create or replace FUNCTION f_find_customer_by_phone(phone_number IN VARCHAR2)
  RETURN customer_details_table
AS
  result customer_details_table;
BEGIN
    P_PHONE_NUMBER_EXIST(f_find_customer_by_phone.phone_number);
    SELECT customer_details(c.FIRSTNAME, c.LASTNAME, c.PHONE_NUMBER, c.EMAIL)
    bulk collect
    INTO result
    FROM customers c
    WHERE c.phone_number = f_find_customer_by_phone.phone_number;

  RETURN result;
END f_find_customer_by_phone;
/

create or replace PROCEDURE p_type_name_exist (
   tn_id IN TABLE_TYPES.TYPE_NAME%TYPE
) AS
   tmp CHAR(1);
BEGIN
   SELECT '1' INTO tmp FROM TABLE_TYPES t WHERE t.TYPE_NAME = tn_id;
EXCEPTION
   WHEN NO_DATA_FOUND THEN
       RAISE_APPLICATION_ERROR(-20003, 'Type name not found');
END p_type_name_exist;
/

create or replace FUNCTION f_get_first_available_table_by_type2(p_type_name IN VARCHAR2,p_start_date date, p_end_date date, p_guests_no int)
RETURN FIRST_TABLE_BY_TYPE_TABLE
as
    result FIRST_TABLE_BY_TYPE_TABLE;
BEGIN

    p_type_name_exist(p_type_name);


    SELECT FIRST_TABLE_BY_TYPE(t.TABLE_ID)
    bulk collect
    INTO result
    FROM TABLES t
    JOIN TABLE_TYPES tt ON t.table_type_id = tt.type_id
    WHERE tt.type_name = p_type_name
    AND (t.no_seats = p_guests_no or t.no_seats = p_guests_no+1)
    AND NOT EXISTS (
        SELECT 1
        FROM RESERVATIONS r
        WHERE r.table_id = t.table_id
        AND r.status IN ('N', 'P')
        AND (
            (r.start_date BETWEEN p_start_date AND p_end_date)
            OR (r.end_date BETWEEN p_start_date AND p_end_date)
            OR (p_start_date BETWEEN r.start_date AND r.end_date)
            OR (p_end_date BETWEEN r.start_date AND r.end_date)
        )
    )
    FETCH FIRST 1 ROWS ONLY;

    RETURN result;
END;
/

