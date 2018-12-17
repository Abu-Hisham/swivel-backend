IF (HAS_PERMS_BY_NAME('master', 'DATABASE', 'ANY') = 0)
BEGIN
	PRINT N'What are you trying to do here, you do not have permissions to master database, please exit ASAP before I consult authorities!'

	RETURN
END

PRINT N'Begin script execution, please do not shut down this pc...'
PRINT N'Bet the only running you do is running scripts like these...'
PRINT N'This script assumes the database is fresh, you will be responsible for any crashes, am just a script I can''t be held liable'

DECLARE @DBNAME NVARCHAR(50)
SET @DBNAME = N'HUDUMA_ECOMMERCE'

IF (NOT EXISTS(SELECT [name] FROM [master].[dbo].[sysdatabases] WHERE ([name] = @dbname)))
BEGIN
	PRINT N'*Face palms* This script is supposed to run on a database called "HUDUMA_ECOMMERCE", create it first then run this script again'
	RETURN
END

USE [HUDUMA_ECOMMERCE]
GO

PRINT N'Now creating tables...'

BEGIN TRY
	BEGIN TRANSACTION

	CREATE TABLE [dbo].[TBAPIACCESSTOKENS](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[APPCHANNELID] [bigint] NULL,
		[ACCESSTOKEN] [nvarchar](max) NULL,
		[CREATEDAT] [datetime] NULL,
		[EXPIRESAT] [datetime] NULL,
		[AESKEYCOMBO] [nvarchar](50) NULL
	)

	CREATE TABLE [dbo].[TBAPIUSERS](
		[ID] [numeric](18, 0) NOT NULL,
		[APIUSER] [nvarchar](50) NOT NULL,
		[APIPASSWORD] [nvarchar](50) NOT NULL,
		[IP] [nvarchar](50) NULL,
		[ACTIVE] [numeric](18, 0) NOT NULL
	)

	CREATE TABLE [dbo].[TBAPPCHANNELS](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[CHANNELNAME] [nvarchar](100) NULL,
		[CHANNELID] [nvarchar](50) NULL,
		[CHANNELSECRET] [nvarchar](100) NULL,
		[CREATEDAT] [datetime] NULL
	)

	CREATE TABLE [dbo].[TBAUDITLOG](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[ACTIONDATE] [datetime] NULL,
		[ACTION] [nvarchar](max) NULL,
		[USERNAME] [nvarchar](50) NULL,
		[DATABEFORE] [nvarchar](max) NULL,
		[DATAAFTER] [nvarchar](max) NULL,
		[REMOTEIP] [nvarchar](50) NULL,
		[LOCALUSER] [nvarchar](50) NULL,
		[USERAGENT] [nvarchar](max) NULL,
		[COUNTRY] [nvarchar](50) NULL,
		[CITY] [nvarchar](50) NULL
	)

	CREATE TABLE [dbo].[TBFREQUENTBILLS](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[TYPEID] [bigint] NULL,
		[CUSTOMERNO] [nvarchar](50) NULL,
		[BILLACCOUNT] [nvarchar](50) NULL,
		[BILLALIAS] [nvarchar](50) NULL
	)

	CREATE TABLE [dbo].[TBCONTACTMESSAGES](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[Name] [nvarchar](100) NULL,
		[Email] [nvarchar](100) NULL,
		[Subject] [nvarchar](100) NULL,
		[Message] [ntext] NULL,
		[SentAt] [datetime] NULL,
		[RegisteredUserID] [bigint] NULL
	)

	CREATE TABLE [dbo].[TBCOUNTIES](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[NAME] [nvarchar](50) NULL,
		[SHORTNAME] [nvarchar](50) NULL,
		[COUNTYCODE] [nvarchar](50) NULL
	)

	CREATE TABLE [dbo].[TBCUSTOMERS](
		[ID] [numeric](14, 0) IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[FIRSTNAME] [varchar](100) NULL,
		[LASTNAME] [varchar](100) NULL,
		[OTHERNAMES] [nvarchar](50) NULL,
		[CUSTOMERNO] [varchar](40) NOT NULL,
		[CHANNEL] [nvarchar](50) NULL,
		[EMAILADDRESS] [varchar](150) NULL,
		[COUNTRY] [varchar](20) NULL,
		[DATEOFBIRTH] [datetime2](0) NULL,
		[REGISTRATIONDATE] [datetime2](0) NULL,
		[APPROVEDBY] [varchar](20) NULL,
		[APPROVEDON] [datetime2](0) NULL,
		[APPROVED] [char](1) NULL,
		[APPROVEDDATE] [datetime2](0) NULL,
		[GENDER] [varchar](200) NULL,
		[NATIONALITY] [nvarchar](20) NULL,
		[IDENTIFICATIONID] [varchar](50) NULL,
		[VERIFIED] [float] NULL,
		[PASSWORD] [nvarchar](100) NULL,
		[BLOCKED] [bit] NULL,
		[BLOCKEDON] [datetime] NULL,
		[BLOCKEDBY] [varchar](50) NULL
	)

	CREATE TABLE [dbo].[TBLINKEDCARDS](
		[id] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[CUSTOMERNO] [nvarchar](50) NULL,
		[MASKEDCARD] [nvarchar](50) NULL,
		[CARDTOKEN] [nvarchar](50) NULL,
		[CARDALIAS] [nvarchar](50) NULL,
		[DATELINKED] [datetime] NULL
	)

	CREATE TABLE [dbo].[TBLOGINTRIES](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[CUSTOMERNO] [bigint] NULL,
		[USERNO] [bigint] NULL,
		[TRIES] [tinyint] NULL,
		[CREATEDAT] [datetime] NULL,
		[UPDATEDAT] [datetime] NULL
	)

	CREATE TABLE [dbo].[TBPASSWORDHISTORY](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[CUSTOMERNO] [nvarchar](50) NULL,
		[PASSWORD] [nvarchar](100) NULL,
		[CREATEDAT] [datetime] NULL
	)

	CREATE TABLE [dbo].[TBPAYMENTMODES](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[NAME] [nvarchar](50) NULL,
		[UNIQID] [nvarchar](50) NULL,
		[FEE] [money] NULL,
		[LIMIT] [money] NULL,
		[PREFIX] [nvarchar](50) NULL,
		[SERVICEID] [nvarchar](50) NULL,
		[GROUPS] [nvarchar](50) NULL,
		[CURRENCY] [nvarchar](50) NULL,
		[MINIMUM] [money] NULL,
		[FLAG] [tinyint] NULL,
		[CREATEDON] [datetime] NULL,
		[CREATEDBY] [varchar](50) NULL,
		[APPROVED] [bit] NULL,
		[APPROVEDBY] [varchar](50) NULL,
		[APPROVEDON] [datetime] NULL,
		[UPDATEDBY] [varchar](50) NULL,
		[UPDATEDON] [datetime] NULL,
		[remarks] [varchar](350) NULL
	)

	CREATE TABLE [dbo].[TBSETTINGS](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[SETTINGKEY] [nvarchar](50) NULL,
		[SETTINGVALUE] [nvarchar](max) NULL,
		[SETAT] [datetime] NULL,
		[ISPUBLIC] [bit] NULL
	)

	CREATE TABLE [dbo].[TBTOKENSTORE](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[TOKEN] [nvarchar](50) NULL,
		[PURPOSE] [nvarchar](50) NULL,
		[ACCOUNTNO] [nvarchar](50) NULL,
		[CREATED] [datetime] NULL,
		[EXPIRES] [datetime] NULL
	)

	CREATE TABLE [dbo].[TBTRANSACTIONDETAILS](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[DateTimeIn] [datetime] NULL,
		[AppChannelId] [bigint] NULL,
		[TypeID] [bigint] NULL,
		[Amount] [money] NULL,
		[PaymentMobile] [nvarchar](50) NULL,
		[BeneficiaryAccountName] [nvarchar](50) NULL,
		[BeneficiaryAccount] [nvarchar](50) NULL,
		[NotificationMobile] [nvarchar](50) NULL,
		[FullNames] [nvarchar](50) NULL,
		[Result] [nvarchar](50) NULL,
		[Description] [nvarchar](max) NULL,
		[Reference] [nvarchar](50) NULL,
		[ModeOfPayment] [bigint] NULL,
		[DebitAccount] [nvarchar](50) NULL,
		[SortCode] [nvarchar](50) NULL,
		[status] [nvarchar](50) NULL,
		[payload] [nvarchar](max) NULL,
		[ServiceTransactionId] [nvarchar](50) NULL,
		[PaymentProcessed] [datetime] NULL,
		[Transacted] [datetime] NULL,
		[CustomerNo] [nvarchar](50) NULL,
		[CountyID] [bigint] NULL,
		[MobileCheckoutRequestId] [nvarchar](50) NULL,
		[Finalised] [datetime] NULL
	)

	CREATE TABLE [dbo].[TBTRANSACTIONTYPES](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[Name] [nvarchar](50) NULL,
		[UNIQID] [nvarchar](50) NULL,
		[FEE] [money] NULL,
		[TRANSACTIONLIMIT] [money] NULL,
		[SERVICEID] [nvarchar](50) NULL,
		[GROUPS] [nvarchar](50) NULL,
		[TRANSACTIONMINIMUM] [money] NULL,
		[PENALTYMINIMUM] [money] NULL,
		[PENALTYLIMIT] [money] NULL,
		[AMOUNTMULTIPLES] [money] NULL,
		[PENALTYMULTIPLES] [money] NULL,
		[FLAG] [tinyint] NULL,
		[COUNTYID] [bigint] NULL,
		[BILLSERVICEID] [nvarchar](50) NULL,
		[OTHERS] [nvarchar](50) NULL,
		[CREATEDBY] [varchar](50) NULL,
		[CREATEDON] [datetime2](7) NULL,
		[APPROVED] [bit] NULL,
		[APPROVEDBY] [varchar](50) NULL,
		[APPROVEDON] [datetime] NULL,
		[UPDATEDBY] [varchar](50) NULL,
		[UPDATEDON] [datetime] NULL,
		[remarks] [varchar](350) NULL,
		[SUCCESSSMS] [ntext] NULL,
		[UNSUCCESSSMS] [ntext] NULL,
		[AppendRefId] [bit] NULL,
		[IMAGEDATA] [varchar](150) NULL
	)

	CREATE TABLE [dbo].[tbUser](
		[id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[username] [nvarchar](255) NOT NULL,
		[auth_key] [nvarchar](32) NULL,
		[password_hash] [nvarchar](255) NOT NULL,
		[password_reset_token] [nvarchar](255) NULL,
		[first_name] [nvarchar](50) NULL,
		[middle_name] [nvarchar](50) NULL,
		[last_name] [nvarchar](50) NULL,
		[email] [nvarchar](255) NULL,
		[user_type] [nvarchar](50) NULL,
		[department] [nvarchar](50) NULL,
		[status] [smallint] NULL,
		[created_at] [datetime] NOT NULL,
		[updated_at] [datetime] NOT NULL,
		[first_login] [bit] NULL,
		[force_password_change] [bit] NULL,
		[locked] [bit] NULL,
		[login_status] [bit] NULL,
		[last_password_change] [datetime] NULL,
		[login_tries] [int] NULL,
		[last_login] [datetime] NULL,
		[user_photo] [nvarchar](250) NULL,
		[approved] [bit] NULL,
		[approved_by] [varchar](50) NULL,
		[approved_on] [datetime] NULL,
		[created_by] [varchar](50) NULL,
		[remarks] [varchar](350) NULL
	)

	CREATE TABLE [dbo].[TRANSACTIONRETRIES](
		[RCID] [bigint] IDENTITY(1,1) NOT NULL PRIMARY KEY,
		[TRANSACTIONDETAIL] [bigint] NULL,
		[TRANSACTIONID] [nvarchar](50) NULL,
		[RETRIEDAT] [datetime] NULL,
		[STATUS] [tinyint] NULL
	)

	COMMIT TRANSACTION

	PRINT N'All tables were successfully created, now proceeding...'
END TRY

BEGIN CATCH
	ROLLBACK TRANSACTION

	PRINT N'We have a situation, operation has been compromised and the tables weren''t created, all of them, script might have gone rogue...'
	PRINT N'The following classified information shows why'

	SELECT ERROR_LINE(), ERROR_MESSAGE(), ERROR_NUMBER(), ERROR_PROCEDURE(), ERROR_SEVERITY(), ERROR_STATE()

	RETURN
END CATCH

PRINT N'Now seeding the initial necessary configurations...'

BEGIN TRY
	BEGIN TRANSACTION

	INSERT INTO [TBSETTINGS] ([SETTINGKEY], [SETTINGVALUE], [SETAT], [ISPUBLIC])
	VALUES	('SESSION_TIMEOUT', '180000', GETDATE(), 1),
			('PASSWORD_POLICY', '{"min": "8", "max": "20", "alphanumeric": "true",  "uppercase": "true", "special": "true"}', GETDATE(), 1)

	DECLARE @NRBCNTY BIGINT

	INSERT INTO [TBCOUNTIES] ([NAME], [SHORTNAME], [COUNTYCODE])
	VALUES ('NAIROBI', 'NRB', '047')

	SET @NRBCNTY = (SELECT SCOPE_IDENTITY())

	INSERT INTO [TBTRANSACTIONTYPES] (
		[Name], [UNIQID], [FEE], [TRANSACTIONLIMIT], [SERVICEID], [GROUPS], [TRANSACTIONMINIMUM], [PENALTYMINIMUM],
		[PENALTYLIMIT], [AMOUNTMULTIPLES], [PENALTYMULTIPLES], [FLAG], [COUNTYID], [BILLSERVICEID], [OTHERS], [CREATEDBY],
		[CREATEDON], [APPROVED], [APPROVEDBY], [APPROVEDON], [UPDATEDBY], [UPDATEDON], [remarks], [SUCCESSSMS],
		[UNSUCCESSSMS], [AppendRefId]
	)
	VALUES
	-- Airtime seeds
	('Safaricom', '5b7a46730e182', 0, 2000, 2, 'Airtime', 10, NULL, NULL, 1, NULL, 1, NULL, NULL, NULL, 'AUTO', GETDATE(), 1, 
		'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 'You have successfully purchased <currency> <amount> <name> on <date>.',
		'Your <name> purchase of <currency> <amount> failed.', 1),
	('Airtel', '5b7a46cfd8fc7', 0, 2000, 3, 'Airtime', 10, NULL, NULL, 1, NULL, 1, NULL, NULL, NULL, 'AUTO', GETDATE(), 1, 
		'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 'You have successfully purchased <currency> <amount> <name> on <date>.',
		'Your <name> purchase of <currency> <amount> failed.', 1),
	('Telkom', '5bd6b912333d2', 0, 2000, 5059, 'Airtime', 10, NULL, NULL, 1, NULL, 1, NULL, NULL, NULL, 'AUTO', GETDATE(), 1, 
		'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 'You have successfully purchased <currency> <amount> <name> on <date>.',
		'Your <name> purchase of <currency> <amount> failed.', 1),
	
	-- Electricity seeds
	('KPLC Prepaid', '5b7a46aee0f8d', 0, 50000, 1, 'KPLC', 100, NULL, NULL, 50, NULL, 1, NULL, 1, 'Prepaid', 'AUTO', GETDATE(),
		1, 'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 
		'Your Kenya Power payment of <currency> <amount> for account number <account> was successful on <date>. Token number <token> for units <units>',
		'Your <name> purchase of <currency> <amount> failed.', 1),
	('KPLC Postpaid', '5b7a46bb658b7', 0, 100000, 4043, 'KPLC', 50, NULL, NULL, 50, NULL, 1, NULL, 4043, 'Postpaid', 'AUTO', GETDATE(),
		1, 'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 'Your Kenya Power payment of <currency> <amount> for meter number <account> was successful on <date>.',
		'Your <name> purchase of <currency> <amount> failed.', 1),

	-- Television seeds
	('DSTV', '5b7a46e3c1d77', 0, 10000, 4044, 'TV', 100, NULL, NULL, 5, NULL, 1, NULL, 4044, NULL, 'AUTO', GETDATE(), 1,
		'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 'Your <name> payment of <currency> <amount> was successful on <date>.',
		'Your <name> payment of <currency> <amount> failed.', 1),
	('GOTV', '5bc413dbd708c', 0, 10000, 4048, 'TV', 100, NULL, NULL, 5, NULL, 1, NULL, 4048, NULL, 'AUTO', GETDATE(), 1,
		'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 'Your <name> payment of <currency> <amount> was successful on <date>.',
		'Your <name> payment of <currency> <amount> failed.', 1),
	('Startimes TV', '5bc416b6e6416', 0, 10000, 5064, 'TV', 100, NULL, NULL, 5, NULL, 1, NULL, 5064, NULL, 'AUTO', GETDATE(), 1,
		'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 'Your <name> payment of <currency> <amount> was successful on <date>.',
		'Your <name> payment of <currency> <amount> failed.', 1),
	('ZUKU TV', '5b7a46db9ad53', 0, 10000, 4049, 'TV', 100, NULL, NULL, 5, NULL, 1, NULL, 4049, NULL, 'AUTO', GETDATE(), 1,
		'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 'Your <name> payment of <currency> <amount> was successful on <date>.',
		'Your <name> payment of <currency> <amount> failed.', 1),

	-- NHIF seed
	('NHIF', '5b7a46ec81eff', 0, 6000, 1019, 'Health', 500, 0, 3000, 500, 250, 1, NULL, 1019, NULL, 'AUTO', GETDATE(), 1,
		'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 
		'Your <name> payment of <currency> <amount> for account number <account> was successful on <date>.',
		'Your <name> payment of <currency> <amount> failed.', 1),

	-- Water seeds
	('Nairobi Water', '5b7a46c6db555', 0, 100000, 1020, 'Water', 50, NULL, NULL, 50, NULL, 1, @NRBCNTY, 1020, NULL, 
		'AUTO', GETDATE(), 1, 'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 
		'Your water bill payment of <currency> <amount> for account number <account> was successful on <date>.',
		'Your <name> payment of <currency> <amount> failed.', 1),

	-- County seeds (Parking and Rent)
	('Nairobi Rent', '5b7a46f58fdcf', 0, 500000, 1016, 'Rent', 500, NULL, NULL, 100, NULL, 1, @NRBCNTY, 1016, NULL,
		'AUTO', GETDATE(), 1, 'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL, 
		'Your payment of <currency> <amount>for <name> was successful on <date>.', 
		'Your <name> payment of <currency> <amount> failed.', 1),
	('Daily Parking', '5b7a46fe611c3', 0, 50000, 1013, 'Parking', 100, NULL, NULL, 50, NULL, 1, @NRBCNTY, 1013, 'Daily',
		'AUTO', GETDATE(), 1, 'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL,
		'Your payment of <currency> <amount>for <name> was successful on <date>.',
		'Your <name> payment of <currency> <amount> failed.', 1),
	('Seasonal Parking', '5b7a4705d7673', 0, 100000, 1014, 'Parking', 1000, NULL, NULL, 50, NULL, 1, @NRBCNTY, 1014, 'Seasonal',
		'AUTO', GETDATE(), 1, 'AUTO', GETDATE(), 'AUTO', GETDATE(), NULL,
		'Your payment of <currency> <amount>for <name> was successful on <date>.',
		'Your <name> payment of <currency> <amount> failed.', 1)

	INSERT INTO [TBPAYMENTMODES] (
		[NAME], [UNIQID], [FEE], [LIMIT], [SERVICEID], [GROUPS], [CURRENCY], [MINIMUM], [FLAG],
		[CREATEDON], [CREATEDBY], [APPROVED], [APPROVEDBY], [APPROVEDON], [UPDATEDBY], [UPDATEDON]
	)
	VALUES
	('CARD', '5b7a44db58297', 0, 100000, 3038, 'Card', 'KES', 10, 1, GETDATE(), 'AUTO', 1, 'AUTO', GETDATE(), 'AUTO', GETDATE()),
	('MPESA', '5b7a464970445', 0, 70000, 5067, 'Mobile', 'KES', 10, 1, GETDATE(), 'AUTO', 1, 'AUTO', GETDATE(), 'AUTO', GETDATE())

	COMMIT TRANSACTION
END TRY

BEGIN CATCH
	ROLLBACK TRANSACTION

	PRINT N'This should not be happening, seeding failed...'
	PRINT N'The following classified information shows why'

	SELECT ERROR_LINE(), ERROR_MESSAGE(), ERROR_NUMBER(), ERROR_PROCEDURE(), ERROR_SEVERITY(), ERROR_STATE()

	RETURN
END CATCH

PRINT N'Script execution completed, now you can go pee...'