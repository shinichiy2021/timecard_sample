/****** Object:  StoredProcedure [dbo].[mappingGetSystemInfo]    Script Date: 2020/02/20 16:03:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mappingGetSystemInfo]
    @companyID NVARCHAR(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング１：バージョン情報の取得
            SELECT
                *
            FROM MK_system
			WHERE
				companyID=@companyID
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

RETURN



GO
/****** Object:  StoredProcedure [dbo].[mappingRelease01]    Script Date: 2020/02/20 16:03:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mappingRelease01]
--パラメーター
 @loginAccount nvarchar(50)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 共通マッピング1：勤務パターンの取得
			SELECT
				*
			FROM
				MK_kanri
			WHERE
				loginAccount=@loginAccount
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

RETURN
GO
/****** Object:  StoredProcedure [dbo].[ver_2_5_Release01]    Script Date: 2020/02/20 16:03:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_Release01]
--パラメーター
 @loginAccount nvarchar(50)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 共通マッピング1：勤務パターンの取得
			SELECT
				*
			FROM
				MK_kanri
			WHERE
				loginAccount=@loginAccount
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

RETURN

GO
/****** Object:  Table [dbo].[MK_buisiness]    Script Date: 2020/02/20 16:03:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_buisiness](
	[No] [nvarchar](4) NOT NULL,
	[buisiness] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_MK_buisiness] PRIMARY KEY CLUSTERED 
(
	[No] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[MK_kanri]    Script Date: 2020/02/20 16:03:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[MK_kanri](
	[companyID] [varchar](4) NOT NULL,
	[companyPass] [nvarchar](50) NOT NULL,
	[loginAccount] [nvarchar](50) NULL,
	[companyName] [nvarchar](255) NULL,
	[accountName] [varchar](255) NOT NULL,
	[userName] [varchar](255) NOT NULL,
	[mailAdd] [nvarchar](255) NOT NULL,
	[iphone_push_file_name] [nvarchar](50) NULL,
 CONSTRAINT [PK_MK_kanri] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[MK_system]    Script Date: 2020/02/20 16:03:42 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_system](
	[versionURL] [nvarchar](50) NOT NULL,
	[VBversionTitle] [nvarchar](50) NOT NULL,
	[versionValue] [nvarchar](50) NOT NULL,
	[iPhoneVer] [nvarchar](10) NULL,
	[androidVer] [nvarchar](10) NULL,
	[vbDotNet] [nvarchar](10) NULL,
	[companyID] [nvarchar](4) NOT NULL,
 CONSTRAINT [PK_MK_system_1] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
USE [master]
GO
ALTER DATABASE [gaia_kanri] SET  READ_WRITE 
GO
