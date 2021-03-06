USE [master]
GO
CREATE DATABASE [gaia_ik]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'release', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL11.MSSQLSERVER\MSSQL\DATA\gaia_ik.mdf' , SIZE = 30784KB , MAXSIZE = UNLIMITED, FILEGROWTH = 1024KB )
 LOG ON 
( NAME = N'release_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL11.MSSQLSERVER\MSSQL\DATA\gaia_ik_log.ldf' , SIZE = 32448KB , MAXSIZE = 2048GB , FILEGROWTH = 10%)
GO
ALTER DATABASE [gaia_ik] SET COMPATIBILITY_LEVEL = 110
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [gaia_ik].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [gaia_ik] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [gaia_ik] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [gaia_ik] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [gaia_ik] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [gaia_ik] SET ARITHABORT OFF 
GO
ALTER DATABASE [gaia_ik] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [gaia_ik] SET AUTO_CREATE_STATISTICS ON 
GO
ALTER DATABASE [gaia_ik] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [gaia_ik] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [gaia_ik] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [gaia_ik] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [gaia_ik] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [gaia_ik] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [gaia_ik] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [gaia_ik] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [gaia_ik] SET  DISABLE_BROKER 
GO
ALTER DATABASE [gaia_ik] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [gaia_ik] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [gaia_ik] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [gaia_ik] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [gaia_ik] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [gaia_ik] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [gaia_ik] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [gaia_ik] SET RECOVERY FULL 
GO
ALTER DATABASE [gaia_ik] SET  MULTI_USER 
GO
ALTER DATABASE [gaia_ik] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [gaia_ik] SET DB_CHAINING OFF 
GO
ALTER DATABASE [gaia_ik] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [gaia_ik] SET TARGET_RECOVERY_TIME = 0 SECONDS 
GO
USE [gaia_ik]
GO
CREATE USER [release] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[release]
GO
CREATE USER [gaia_ik] FOR LOGIN [gaia_ik] WITH DEFAULT_SCHEMA=[gaia_ik]
GO
CREATE USER [dev] FOR LOGIN [dev] WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [release]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [release]
GO
ALTER ROLE [db_datareader] ADD MEMBER [release]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [release]
GO
ALTER ROLE [db_ddladmin] ADD MEMBER [gaia_ik]
GO
ALTER ROLE [db_backupoperator] ADD MEMBER [gaia_ik]
GO
ALTER ROLE [db_datareader] ADD MEMBER [gaia_ik]
GO
ALTER ROLE [db_datawriter] ADD MEMBER [gaia_ik]
GO
CREATE SCHEMA [gaia_ik]
GO
CREATE SCHEMA [r_15502_developer]
GO
CREATE SCHEMA [release]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping100101]
    @email NVARCHAR(255),
    @passWord NVARCHAR(50)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング１：ログイン情報のチェック
            SELECT
                staffID,
                companyID
            FROM MK_staff
            WHERE 
                email = @email AND
                passWord = @passWord
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping100102]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @idm NVARCHAR(16),
    @name NVARCHAR(255),
    @registerID NVARCHAR(255),
    @UUID NVARCHAR(255)
AS


BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            SELECT
                count(*) AS commitCount
            FROM
                MK_smartPhone
            WHERE 
                companyID=@companyID AND
                staffID=@staffID AND
                idm=@idm AND
                name=@name AND
                registerID=@registerID AND
                -- SYSDATETIME(),
                UUID=@UUID
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -------------------------------------------------------
            -- マッピング２、スマホ情報の登録処理
            -------------------------------------------------------
            -- logout のデータが存在しているとき削除処理を実行する
            DECLARE @logoutCount INT
            SELECT
                @logoutCount = count(*)
            FROM
                MK_smartPhone
            WHERE 
                registerID = 'logout' AND
                companyID = @companyID AND
                staffID = @staffID
            IF @logoutCount > 0
                DELETE
                FROM
                    MK_smartPhone
                WHERE
                    registerID = 'logout' AND
                    companyID = @companyID AND
                    staffID = @staffID
            -- 端末識別番号（IDM）の存在チェック
            DECLARE @registerCount INT
            SELECT
                @registerCount = count(*)
            FROM
                MK_smartPhone
            WHERE 
                registerID = @registerID
            IF @registerCount > 0
                -- 既存のスマホ情報更新を行う
                UPDATE
                    MK_smartPhone
                SET
                    companyID=@companyID,
                    staffID=@staffID,
                    idm=@idm,
                    name=@name,
                    registerID=@registerID,
                    entryDate=SYSDATETIME(),
                    UUID=@UUID,
                    udid=@UUID
                WHERE
                    registerID = @registerID
            ELSE
                -- 新規スマホ情報登録を行う
                INSERT INTO MK_smartPhone
                VALUES(
                    @companyID,
                    @staffID,
                    @idm,
                    @name,
                    @registerID,
                    SYSDATETIME(),
                    @UUID,
                    @UUID
                )
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
    RETURN
END CATCH






RETURN




GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping100103]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @idm NVARCHAR(16),
    @name NVARCHAR(255),
    @registerID NVARCHAR(255),
    @UUID NVARCHAR(255)
AS

BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            SELECT
                count(*) AS commitCount
            FROM
                MK_smartPhone
            WHERE 
                companyID=@companyID AND
                staffID=@staffID AND
                idm=@idm AND
                name=@name AND
                registerID=@registerID AND
                -- SYSDATETIME(),
                UUID=@UUID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping200101]
  
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング１：バージョン情報の取得
            SELECT
                versionURL,
                versionValue
            FROM MK_system
			WHERE
				no='1'
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping300201]
    @companyPass NVARCHAR(50),
    @loginAccount NVARCHAR(50)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 会社番号の抽出
            SELECT
                companyID
            FROM MK_company
            WHERE 
                companyPass = @companyPass AND
                loginAccount = @loginAccount
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping300202]
    @staffID NVARCHAR(20),
    @companyID NVARCHAR(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- スタッフ氏名の抽出
            SELECT
                name
            FROM MK_staff
            WHERE
                staffID = @staffID AND
                companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping300203]
    @staffID NVARCHAR(20),
    @companyID NVARCHAR(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 登録済みデータのチェック
            SELECT *
            FROM MK_smartPhone
            WHERE
                staffID = @staffID AND
                name = N'card' AND
                companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping300204]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @idm NVARCHAR(16)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- カード情報の登録
            INSERT INTO MK_smartPhone(
                companyID,
                staffID,
                idm,
                name,
                registerID,
                entryDate,
                UUID
            ) VALUES(
                @companyID,
                @staffID,
                @idm,
                N'card',
                '',
                SYSDATETIME(),
                ''
            )
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping300205]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @idm NVARCHAR(16)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- カード情報登録のチェック
            SELECT
                count(*) AS commitCount
            FROM
                MK_smartPhone
            WHERE
                companyID=@companyID AND
                staffID=@staffID AND
                idm=@idm AND
                name=N'card'
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[mapping300501]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @password NVARCHAR(20)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		--権限取得
		SELECT 
			admCD		
		FROM 
			MK_staff		
		WHERE 
			(companyID = @companyID) 
			AND 
			(staffID = @staffID) 
			AND 
			(password = @password)		
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_100101]
    @email NVARCHAR(255),
    @passWord NVARCHAR(50)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング１：ログイン情報のチェック
            SELECT
                staffID,
                companyID
            FROM MK_staff
            WHERE 
                email = @email AND
                passWord = @passWord
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_100102]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @idm NVARCHAR(16),
    @name NVARCHAR(255),
    @registerID NVARCHAR(255),
    @UUID NVARCHAR(255)
AS

BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -------------------------------------------------------
            -- マッピング２、スマホ情報の登録処理
            -------------------------------------------------------
            -- logout のデータが存在しているとき削除処理を実行する
            DECLARE @logoutCount INT
            SELECT
                @logoutCount = count(*)
            FROM
                MK_smartPhone
            WHERE
                registerID = 'logout' AND
                companyID = @companyID AND
                staffID = @staffID
            IF @logoutCount > 0
                DELETE
                FROM
                    MK_smartPhone
                WHERE
                    registerID = 'logout' AND
                    companyID = @companyID AND
                    staffID = @staffID
            -- 端末識別番号（IDM）の存在チェック
            DECLARE @registerCount INT
            SELECT
                @registerCount = count(*)
            FROM
                MK_smartPhone
            WHERE
                registerID = @registerID
            IF @registerCount > 0
                -- 既存のスマホ情報更新を行う
                UPDATE
                    MK_smartPhone
                SET
                    companyID=@companyID,
                    staffID=@staffID,
                    idm=@idm,
                    name=@name,
                    registerID=@registerID,
                    entryDate=SYSDATETIME(),
                    UUID=@UUID
                WHERE
                    registerID = @registerID
            ELSE IF @registerID <> '(null)'
                -- 新規スマホ情報登録を行う
                INSERT INTO MK_smartPhone
                VALUES(
                    @companyID,
                    @staffID,
                    @idm,
                    @name,
                    @registerID,
                    SYSDATETIME(),
                    @UUID
                )
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
    RETURN
END CATCH

RETURN




GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200101]
  
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング１：バージョン情報の取得
            SELECT
                versionURL,
                versionValue
            FROM MK_system
			WHERE
				no='1'
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200102]
  @myTextName NVARCHAR(50)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：会社情報の取得
           SELECT
             companyID,
             companyPass,
             loginAccount
           FROM MK_company
           WHERE
            loginAccount= @myTextName
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200104]
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：ログイン者の権限取得
            SELECT
                *
            FROM MK_staff
            WHERE
                staffID= @staffID AND
                companyID= @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200201]
  @companyID nvarchar(4),
  @today nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：お知らせデータの取得
            SELECT
                eventNo,
                title,
                subTitle,
                keisaiKigen
             FROM MK_event
             WHERE
                companyID= @companyID AND
                keisaiKigen>= @today
             ORDER BY
                title,
                keisaiKigen
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


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[ver_2_5_200202]
    @companyID nvarchar(4),
    @today nvarchar(10),
    @postID nvarchar(2)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：打刻忘れデータの取得
            IF @postID='-1'
                SELECT
                    COUNT(staffID) AS dakokuCount
                FROM MK_kintai
                WHERE
                    ymd<> @today AND
                    ISNULL(outOffice, N'')='' AND
                    companyID= @companyID
            ELSE
                SELECT
                    COUNT(MK_kintai.staffID) AS dakokuCount
                FROM MK_kintai
                INNER JOIN MK_staff ON 
                    MK_kintai.companyID = MK_staff.companyID AND 
                    MK_kintai.staffID = MK_staff.staffID
                WHERE
                    ymd<> @today AND
                    ISNULL(outOffice, N'')='' AND
                    MK_staff.postID=@postID AND
                    MK_kintai.companyID= @companyID
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


SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200203]
--パラメーター
 @companyID nvarchar(4),
 @admCD int,
 @staff nvarchar(20)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：承認待ちデータの取得
			DECLARE @varSQL VARCHAR(max)
			DECLARE @admSQL VARCHAR(max)

            IF @admCD = 1
			   SET @admSQL = 'AND shoninStaffID =''' + @staff + ''''
			ELSE
			   SET @admSQL =''

			SET @varSQL = 
                'SELECT '+
                    'ISNULL(SUM(CASE WHEN sub1.shoninFlag = 0 THEN 1 END), 0) AS syoninMachi '+
			    'FROM '+
                    '(SELECT '+
                        'shoninFlag '+
                    'FROM MK_sinsei '+
                    'WHERE '+
                        'companyID=''' + @companyID + ''' '+
			            @admSQL +
			        'GROUP BY '+
                        'sinseiNo, '+
                        'shoninFlag '+
                    ') AS sub1 '
			--SQL実行
			EXEC (@varSQL)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200204]
  @companyID nvarchar(4),
  @today nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：打刻忘れデータの一番古い日付を取得する
			SELECT
			    MIN(ymd) AS ymd
			FROM MK_kintai
			WHERE
				ymd<>@today AND
				ISNULL(outOffice, N'')='' AND
				companyID= @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200205]
--パラメーター
 @today nvarchar(10),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		-- マッピング：退職者のスマホマスタ情報の確認
				SELECT 
					MK_staff.staffID
				FROM
					MK_staff INNER JOIN
					MK_smartPhone ON 
					MK_staff.companyID = MK_smartPhone.companyID AND 
					MK_staff.staffID = MK_smartPhone.staffID
				WHERE
				   (MK_staff.companyID = @companyID) AND 
				   (MK_staff.retireDate <> N'') AND 
				   (MK_staff.retireDate < @today)

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200206]
--パラメーター
 @today nvarchar(10),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		-- マッピング：退職者のスマホマスタ情報の削除
		CREATE TABLE #TempSmartTable (
			  staffID NVARCHAR(20)
		)
			INSERT INTO #TempSmartTable
				EXEC ver_2_5_200205 @today,@companyID
			---- 格納域
			--declare @tid INT
			declare @retireStaffID NVARCHAR(20)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #TempSmartTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
               @retireStaffID
			-- カーソルが読み取れなくなるまで
			while (@@fetch_status = 0) begin															
                --		◇スマホ所持者が存在する時																			
                --		・一時テーブルのデータの数だけ以下の処理を繰り返す。																												
                -- 退職者のスマホマスタ情報の削除
                EXEC ver_2_5_201609 @retireStaffID,@companyID
				-- カーソル移動
			    fetch next from temp_cursor into @retireStaffID
			end
			-- カーソルを閉じる
			close temp_cursor
			-- カーソルを解放
			deallocate temp_cursor
			-- 必要なくなった一時テーブルを削除
			drop table #TempSmartTable	
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200401]
  @companyID nvarchar(4),
  @eventNo int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：お知らせの取得
            SELECT			
                EV.title,			
                EV.subTitle,			
                EV.keisaiKigen,			
                EV.note,			
                ISNULL(CO.name,'削除されたスタッフ') AS name,			
                EV.staffID			
            FROM MK_event AS EV			
                LEFT OUTER JOIN MK_staff AS CO ON			
                EV.staffID=CO.staffID AND			
                EV.companyID = CO.companyID			
            WHERE			
                EV.companyID=@companyID AND			
                EV.eventNo=@eventNo		

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200402]
  @companyID nvarchar(4),
  @eventNo int,
  @today nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：未読者の取得
			SELECT MK_smartPhone.companyID,
				   MK_smartPhone.staffID,
				   MK_staff.name
			FROM   MK_smartPhone INNER JOIN MK_staff ON 
				   MK_smartPhone.companyID = MK_staff.companyID AND 
				   MK_smartPhone.staffID = MK_staff.staffID LEFT OUTER JOIN
				   MK_history ON 
				   MK_smartPhone.companyID = MK_history.companyID AND 
				   MK_smartPhone.staffID = dbo.MK_history.staffID
			WHERE  (MK_smartPhone.name <> N'card') AND 
				   ((MK_history.category = 2) AND 
				   (MK_history.flag = 0) AND 
				   (MK_history.companyID = @companyID) AND 
				   (MK_history.externNo = @eventNo) AND 
				   (MK_staff.retireDate > @today OR
					MK_staff.retireDate IS NULL OR
					MK_staff.retireDate = '') OR
				   (MK_history.flag IS NULL))
			GROUP BY MK_smartPhone.companyID,
					 MK_smartPhone.staffID, 
					 MK_staff.name, 
					 MK_history.externNo
			ORDER BY MK_smartPhone.staffID			
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200409]
--パラメーター
 @companyID nvarchar(4),
 @eventNo int,
 @today nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：
			-- 一時テーブルの作成
			CREATE TABLE #TemporaryTable (
			  tid INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
			  company NVARCHAR(4),
			  staffID NVARCHAR(255),
			  name NVARCHAR(255)
			
			)
			-- マッピング2：未読者の取得を一時テーブルにデータを追加
			INSERT INTO #TemporaryTable
			EXEC ver_2_5_200402 @companyID,@eventNo,@today
			---- 格納域
			declare @tid INT
			declare @company NVARCHAR(4)
			declare @staffID NVARCHAR(MAX)
			declare @name NVARCHAR(MAX)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #TemporaryTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into @tid,@company,@staffID,@name
			-- カーソルが読み取れなくなるまで
			while (@@fetch_status = 0)
			    begin
			    -- 取得したtidでデータ更新
				--未読スタッフのヒストリーテーブルデータの取得
				DECLARE @historyCount INT
				SELECT
					   @historyCount = count(*)
				FROM   MK_history
				WHERE  
					(companyID =@companyID) AND 
					(externNo = @eventNo) AND 
					(flag = 0) AND 
					(staffID = @staffID)
				--ヒストリーテーブルにデータが存在する時はデータ更新
				IF @historyCount > 0
                    BEGIN
					UPDATE
						MK_history							
					SET							
						ymdTime=SYSDATETIME(),						
						flag=0					
					WHERE							
						companyID = @companyID AND
						staffID = @staffID AND
						externNo = @eventNo AND
						category = 2
                    END
				-- ヒストリーテーブルにデータが無い時は新規未読ヒストリーを登録
				ELSE
                    BEGIN
					INSERT INTO
					MK_history(						
						category,					
						ymdTime,					
						staffID,					
						companyID,					
						flag,					
						externNo					
					)		
					VALUES(						
						2,					
						SYSDATETIME(),					
						@staffID,
						@companyID,
						0,
						@eventNo
					)
                    END			
			    -- カーソル移動
			    fetch next from temp_cursor into @tid,@company,@staffID,@name
			    end
			-- カーソルを閉じる
			close temp_cursor
			-- カーソルを解放
			deallocate temp_cursor
			-- 追加、更新したテーブルを表示
			select * from #TemporaryTable
			SELECT * FROM MK_history WHERE (companyID = @companyID) AND (externNo = @eventNo)
			-- 必要なくなった一時テーブルを削除
			drop table #TemporaryTable
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ver_2_5_200411]
--パラメーター
  @staffID nvarchar(20),
  @kubun nvarchar(255),
  @title nvarchar(255),
  @keisaiKigen nvarchar(10),
  @msgText nvarchar(255),
  @companyID nvarchar(4),
  @today nvarchar(10),
  @eventNo int,
  @sakuseiDateTime datetime
AS
BEGIN TRY
    BEGIN TRANSACTION BEGIN        --トランザクションの開始
		begin
		IF @eventNo = 0			
		--   お知らせの登録（インサート）を実施。	
		    BEGIN
			INSERT INTO 
				MK_event(			
					staffID,			
					title,			
					subTitle,			
					keisaiKigen,			
					note,			
					companyID,			
					sakuseiDate			
				)			
			VALUES(			
				@staffID,			
				@kubun,			
				@title,			
				@keisaiKigen,			
				@msgText,			
				@companyID,			
				@sakuseiDateTime
			)		
			--　新規登録したイベントNoを取得する
			CREATE TABLE #eventTable(
				eventNo INT
			)
			INSERT INTO #eventTable	
			EXEC mapping200412 @staffID,@companyID,@sakuseiDateTime
			declare @tid INT
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #eventTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @tid
				while (@@fetch_status = 0) begin
					SET @eventNo = @tid
						-- カーソル移動
			    fetch next from temp_cursor into @tid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #eventTable
			END
		ELSE
		--   お知らせの更新（アップデート）を実施。	
		UPDATE MK_event
            SET									
                title = @kubun,
                subTitle = @title,
                keisaikigen = @keisaiKigen,								
                note = @msgText,
                staffID = @staffID
            WHERE									
                companyID = @companyID AND
                eventNo= @eventNo
		END
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200412]
  @staffID nvarchar(20),
  @companyID nvarchar(4),
  @sakuseiDateTime datetime
AS
BEGIN TRY
    BEGIN TRANSACTION BEGIN        --トランザクションの開始
	--新規登録したイベントNoを取得する
			SELECT			
               eventNo
            FROM MK_event			
            WHERE			
                companyID   = @companyID AND			
				staffID = @staffID AND
				sakuseiDate = @sakuseiDateTime
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ver_2_5_200413]
--パラメーター
  @staffID nvarchar(20),
  @companyID nvarchar(4),
  @today nvarchar(10),
  @eventNo int,
  @sakuseiDateTime datetime,
  @midokuFlg int
AS
BEGIN TRY
    BEGIN TRANSACTION BEGIN        --トランザクションの開始
        --　通知履歴の更新と追加を行う
                --未読スタッフのヒストリーテーブルデータの取得
		BEGIN
                DECLARE @historyCount INT
                SELECT
                        @historyCount = count(*)
                FROM   MK_history
                WHERE  
                    (companyID =@companyID) AND 
                    (externNo = @eventNo) AND 
                    (staffID = @staffID)
		END
        --ヒストリーテーブルにデータが存在する時はデータ更新
		BEGIN											  															
                IF @historyCount > 0
                        UPDATE
                            MK_history							
                        SET							
                            ymdTime= @sakuseiDateTime,					
                            flag=@midokuFlg				
                        WHERE							
                            companyID = @companyID AND
                            staffID   = @staffID AND
                            externNo  = @eventNo AND
                            category  = 2
                ELSE
                        -- ヒストリーテーブルにデータが無い時は新規未読ヒストリーを登録
                        --		◇パラメータ作成者のスタッフIDと登録対象スタッフIDが一致し無い時																  															
                        INSERT INTO
                        MK_history(						
                            category,					
                            ymdTime,					
                            staffID,					
                            companyID,					
                            flag,					
                            externNo					
                        )		
                        VALUES(						
                            2,					
                            @sakuseiDateTime,					
                            @staffID,
                            @companyID,
                            @midokuFlg,
                            @eventNo
                        )
        END
    COMMIT TRANSACTION       --トランザクションを確定
    END
END TRY
--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200417]
--パラメーター
 @companyID nvarchar(4),
 @eventNo int
AS
BEGIN TRY
    BEGIN TRANSACTION BEGIN        --トランザクションの開始
		--------------------------------------------
		--お知らせの削除
		--------------------------------------------
		DELETE
			MK_event								
		WHERE
			companyID = @companyID AND						
			eventNo = @eventNo
		--削除の確認 
		DECLARE @eventCount INT
		SELECT
			@eventCount = count(eventNo)
        FROM
			MK_event
        WHERE
			companyID = @companyID AND
			eventNo = @eventNo
		--削除成功時　通知履歴の削除を実施する
		IF @eventCount = 0 begin
			DELETE
				MK_history
			WHERE					
				companyID = @companyID AND
				externNo = @eventNo AND
				category = '2'
        end
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200501]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：基本パターンの締日の取得
            SELECT
                endDate
            FROM
                MK_pattern
            WHERE
                companyID=@companyID AND
                patternNo=0
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200502]
  @companyID nvarchar(4),
  @name nvarchar(21)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：氏名曖昧検索の締日の取得
            SELECT
                MK_pattern.endDate
            FROM MK_pattern
                INNER JOIN MK_staff ON
                MK_pattern.patternNo=MK_staff.patternNo AND
                MK_pattern.companyID=MK_staff.companyID
            WHERE
                MK_pattern.companyID=@companyID AND
                MK_staff.name LIKE '%'+ @name +'%'
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200503]
  @companyID nvarchar(4),
  @patternNo int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：勤怠パターン絞込での締日の取得
            SELECT
                endDate
            FROM MK_pattern
            WHERE
                companyID= @companyID AND
                patternNo= @patternNo
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200504]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：氏名検索一覧の取得
            SELECT
                name,
                staffID
            FROM MK_staff
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200505]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：所属部署検索一覧の取得
             SELECT
                ISNULL(MK_post.postName,'') AS postName,
                MK_post.postID
             FROM MK_post
             WHERE
                companyID= @companyID
             ORDER BY
                MK_post.postName ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200506]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：雇用形態検索一覧の取得
            SELECT
                ISNULL(MK_kubun.kubunName,'') AS kubunName,
                MK_kubun.kubun
            FROM MK_kubun
            WHERE
                companyID=@companyID
            ORDER BY
                MK_kubun.kubunName ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200507]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング7：勤怠パターン検索一覧の取得
            SELECT
                ISNULL(MK_pattern.memo,'') AS patternName,
                MK_pattern.patternNo
            FROM MK_pattern
            WHERE
                companyID = @companyID
            ORDER BY
                MK_pattern.memo ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200508]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング8：締日検索一覧の取得
            SELECT
                ISNULL(MK_pattern.endDate,'')AS endDate
            FROM MK_pattern
            WHERE
                companyID = @companyID
            GROUP BY
                MK_pattern.endDate
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200509]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング9：パターン内の締日の検索
			SELECT
                endDate
            FROM MK_pattern
            WHERE
                MK_pattern.companyID = @companyID
            GROUP BY
                MK_pattern.endDate
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200510]
  @companyID nvarchar(4),
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @staffID nvarchar(20),
  @name nvarchar(21),
  @endDate varchar(2),
  @sPost varchar(2),
  @sKubun varchar(2),
  @sPattern varchar(max)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		--ベースSQL
		    DECLARE @varSQL VARCHAR(max)
			DECLARE @sqlEND VARCHAR(max)
			-- マッピング10：在職全社員の基本情報の取得

			SET @varSQL=
                'SELECT DISTINCT '+
                    'MK_staff.staffID, '+
                    'MK_staff.name, '+
                    'MK_post.postName, '+
			        'MK_kubun.kubunName, '+
                    'ISNULL(MK_pattern.memo, '''') AS patternName, '+
                    'MK_pattern.endDate '+
			    'FROM MK_staff '+
                'LEFT OUTER JOIN MK_pattern ON '+
			        'MK_staff.companyID = MK_pattern.companyID AND '+
                    'MK_staff.patternNo = MK_pattern.patternNo '+
			    'INNER JOIN MK_post ON '+
			        'MK_staff.postID = MK_post.postID AND '+
                    'MK_staff.companyID = MK_post.companyID '+
			    'INNER JOIN MK_kubun ON '+
			        'MK_staff.kubun = MK_kubun.kubun AND '+
                    'MK_staff.companyID = MK_kubun.companyID '+
			    'WHERE '+
                    'MK_staff.companyID = ''' + @companyID + ''' AND '+
                    'MK_staff.entDate <= '''+ @ymdB + ''' AND '+
                    '( '+
                        'MK_staff.retireDate ='''' OR '+
			            'MK_staff.retireDate IS NULL OR '+
			            'MK_staff.retireDate >= ''' + @ymdA + ''' ' +
                    ') AND '+
			        'MK_staff.staffID LIKE ''%'+ @staffID +'%'' AND '+
			        'MK_staff.name LIKE ''%' + @name + '%'' AND '+
                    'MK_pattern.endDate =''' + @endDate + ''' '
			SET @sqlEND=
                'GROUP BY '+
                    'MK_staff.staffID, '+
                    'MK_staff.name, '+
                    'MK_post.postName, '+
                    'MK_kubun.kubunName, '+
                    'MK_pattern.memo, '+
                    'MK_pattern.endDate '
			----条件がある場合、条件セット
			IF @sPost <> '-1'
			SET @varSQL = @varSQL + ' AND MK_post.postID =' + @sPost
				
			IF @sKubun <> '-1'
			SET @varSQL = @varSQL+ ' AND MK_kubun.kubun =' + @sKubun
		
			IF @sPattern <> '-1'
			SET @varSQL = @varSql + ' AND MK_pattern.patternNo = ' + @sPattern

			SET @varSQL = @varSQL + @sqlEND

			--SQL実行
			EXEC (@varSQL)
		END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
return @varSQL
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
RETURN


GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200511]
  @companyID nvarchar(4),
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @staffID nvarchar(20),
  @name nvarchar(21),
  @endDate varchar(2),
  @sPost varchar(2),
  @sKubun varchar(2),
  @sPattern varchar(max)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
			DECLARE @varSQL VARCHAR(max)
			DECLARE @sqlEND VARCHAR(max)
			-- マッピング11：指定期間内の勤怠データの取得
			SET @varSQL=
                'SELECT DISTINCT '+
                    'MK_kintai.staffID, '+
                    'MK_staff.name, '+
                    'ISNULL(MK_post.postName, '''') AS postName, '+
                    'ISNULL(MK_kubun.kubunName, '''') AS kubunName, '+
			        'ISNULL(MK_pattern.memo, '''') AS patternName, '+
                    'ISNULL(SUM(CASE WHEN MK_kintai.overTime > 0 then 1 ELSE 0 END),'''') AS zangyou, '+
			        'ISNULL(SUM(MK_kintai.underTime),'''') AS underTime, '+
                    'ISNULL(SUM(MK_kintai.outTime),'''') AS outTime, '+
                    'ISNULL(SUM(MK_kintai.inTime),'''') AS inTime, '+
			        'ISNULL(SUM(MK_kintai.overTime),'''') AS overTime, '+
                    'SUM(CASE WHEN MK_kintai.kintaiNo = ''0'' THEN 1 ELSE 0 END) AS kinmuDay '+
			    'FROM MK_staff '+
                'LEFT OUTER JOIN MK_pattern ON '+
			        'MK_staff.companyID = MK_pattern.companyID AND '+
                    'MK_staff.patternNo = MK_pattern.patternNo '+
			    'INNER JOIN MK_post ON '+
                    'MK_staff.postID = MK_post.postID AND '+
                    'MK_staff.companyID = MK_post.companyID '+
                'LEFT OUTER JOIN MK_kintai ON '+
                    'MK_staff.staffID = MK_kintai.staffID AND '+
                    'MK_staff.companyID = MK_kintai.companyID '+
			    'INNER JOIN MK_kubun ON '+
                    'MK_staff.kubun = MK_kubun.kubun AND '+
                    'MK_staff.companyID = MK_kubun.companyID '+
			    'WHERE '+
                    'MK_kintai.companyID = ''' + @companyID + ''' AND '+
                    'MK_kintai.ymd >= ''' + @ymdA+ ''' AND '+
                    'MK_kintai.ymd <= ''' + @ymdB+ ''' AND '+
                    'MK_staff.staffID LIKE ''%'+ @staffID +'%'' AND '+
			        'MK_staff.name LIKE ''%' + @name + '%'' AND '+
                    'MK_pattern.endDate =''' + @endDate + ''''
			SET @sqlEND =
                'GROUP BY '+
                    'MK_kintai.staffID, '+
                    'MK_kintai.memo, '+
                    'MK_staff.name, '+
                    'MK_post.postName, '+
                    'MK_kubun.kubunName, '+
                    'MK_pattern.memo '
			----条件がある場合、条件セット
			IF @sPost <> '-1'
			SET @varSQL = @varSQL+ ' AND MK_post.postID = ' + @sPost
			IF @sKubun <> '-1'
			SET @varSQL = @varSQL+ ' AND MK_kubun.kubun = ' + @sKubun
			IF @sPattern <> '-1'
			SET @varSQL = @varSql+' AND MK_pattern.patternNo = ' + @sPattern
			SET @varSQL = @varSQL + @sqlEND
			--SQL実行
			EXEC (@varSQL)
		END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
print @varSQL
RETURN



GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATe PROCEDURE [dbo].[ver_2_5_200601]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：所定時間・所定フラグの取得
		    SELECT
                name,
                presTime,
                presFlag
            FROM MK_company
            WHERE
                companyID= @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200602]
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：スタッフ情報の取得
		    SELECT
                MK_staff.name
            FROM
                MK_staff
            WHERE
                staffID = @staffID AND
                companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200603]
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：集計部分の取得
			SELECT DISTINCT
				MK_kintai.staffID,
				MK_staff.postID,
				MK_staff.kubun,
				--SUM(CASE WHEN MK_kintai.overTime > 0 AND MK_kintai.kintaiNo = 0 then 1 ELSE 0 END) AS outTimeDay,
				ISNULL(SUM(MK_kintai.underTime),'') AS underTime,
				ISNULL(SUM(MK_kintai.inTime),'') AS inTime,
				ISNULL(SUM(MK_kintai.outTime),'') AS outTime,
				ISNULL(SUM(MK_kintai.overTime),'') AS overTime,
				ISNULL(SUM(MK_kintai.midnight),'') AS nightTime,
				--COUNT( MK_kintai.kintaiNo) AS kinmuDay
				SUM(CASE WHEN MK_kintai.kintaiNo = 0 then 1 ELSE 0 END) AS kinmuDay
			FROM
				MK_kintai INNER JOIN
				MK_staff ON MK_kintai.staffID = MK_staff.staffID AND
				MK_kintai.companyID = MK_staff.companyID
			WHERE
				MK_kintai.ymd>=@ymdA AND
				MK_kintai.ymd<=@ymdB AND
				MK_kintai.staffID=@staffID AND
				--MK_kintai.kintaiNo = 0 AND
				MK_kintai.companyID=@companyID
			GROUP BY
				MK_kintai.staffID,
				MK_staff.postID,
				MK_staff.kubun
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200604]
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：対象スタッフの休日カレンダー番号の取得
            SELECT
                calendarID
            FROM MK_staff
            WHERE
                companyID=@companyID AND
                staffID=@staffID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200605]
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @calID int,
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：休日勤務日の勤怠データの取得
            SELECT
                MK_calendar.calYmd,
                ISNULL(SUM(MK_kintai.inTime),'') AS inTimeSum,
                ISNULL(SUM(MK_kintai.underTime),'') AS underTimeSum,
                ISNULL(SUM(MK_kintai.overTime),'') AS overTimeSum,
                ISNULL(SUM(MK_kintai.outTime),'') AS outTimeSum
            FROM MK_calendar
            INNER JOIN MK_calManager ON
                MK_calendar.number = MK_calManager.number AND
                MK_calendar.companyID = MK_calManager.companyID
            INNER JOIN MK_kintai ON
                MK_calendar.calYmd = MK_kintai.ymd AND
                MK_calendar.companyID = MK_kintai.companyID
            WHERE
                MK_calManager.companyID=@companyID AND
                MK_calendar.number = @calID AND
                MK_kintai.staffID = @staffID AND
                MK_calendar.calYmd >= @ymdA AND
                MK_calendar.calYmd <= @ymdB
            GROUP BY
                MK_calendar.calYmd
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200606]
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：勤怠設定情報取得
			SELECT
				MK_staff.entDate,
				MK_staff.patternNo,
				ISNULL(MK_staff.retireDate, '') AS retireDate,
				MK_pattern.startWork,
				MK_pattern.endWork,
				MK_pattern.startMarume,
				MK_pattern.endMarume,
				MK_pattern.goReternMarume,
				MK_pattern.restMarume
			FROM
				MK_staff LEFT OUTER JOIN
				MK_kubun ON MK_staff.kubun = MK_kubun.kubun AND
				MK_staff.companyID = MK_kubun.companyID LEFT OUTER JOIN
				MK_post ON MK_staff.postID = MK_post.postID AND
				MK_staff.companyID = MK_post.companyID INNER JOIN
				MK_pattern ON MK_staff.patternNo = MK_pattern.patternNo AND
				MK_staff.companyID = MK_pattern.companyID
			WHERE
				staffID = @staffID AND
				MK_staff.companyID =@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200607]
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング7：勤怠データの取得
			SELECT
				ymd,
				kintaiNo,
				youbi,
				ISNULL(inOffice,'') AS inOffice,
				outOffice, restTime,
				ISNULL(underTime,'') AS underTime,
				ISNULL(overTime,'') AS overTime,
				ISNULL(inTime,'') AS inTime,
				ISNULL(outTime,'') AS outTime,
				ISNULL((underTime + outTime + overTime),'') AS totalRoudou,
				ISNULL(maruInOffice, '') AS maruInOffice,
				ISNULL(maruOutOffice, '') AS maruOutOffice,
				ISNULL(midnight, '') AS midnight,
				--ISNULL(inPosition, '0') AS inPosition,
				--ISNULL(outPosition, '0') AS outPosition,
				CASE WHEN inPosition > '0' THEN inPosition ELSE '0' END AS inPosition,
				CASE WHEN outPosition > '0' THEN outPosition ELSE '0' END AS outPosition,
				ISNULL(inPositionAdd,'') AS inPositionAdd,
				ISNULL(outPositionAdd,'') AS outPositionAdd,
				ISNULL(inPointNo,'')AS inPointNo,
				ISNULL(outPointNo,'')AS outPointNo,
				ISNULL(MK_dakokuPoint.pointName,'') AS inPointName,
				ISNULL(MK_dakokuPoint_1.pointName,'') AS outPointName
			FROM 
				MK_kintai 
				LEFT OUTER JOIN
                MK_dakokuPoint ON 
				MK_kintai.companyID = MK_dakokuPoint.companyID AND 
				MK_kintai.inPointNo = MK_dakokuPoint.pointNo 
				LEFT OUTER JOIN
                MK_dakokuPoint AS MK_dakokuPoint_1 ON 
				MK_kintai.companyID = MK_dakokuPoint_1.companyID AND 
                MK_kintai.outPointNo = MK_dakokuPoint_1.pointNo
			WHERE
				MK_kintai.ymd >=@ymdA AND
				MK_kintai.ymd <=@ymdB AND
				MK_kintai.staffID = @staffID AND
				MK_kintai.companyID =@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200608]
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @calID int,
  @companyID nvarchar(4)  
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング8：休日を取得
			SELECT
				MK_calendar.calYmd,
				MK_calendar.holiday
			FROM
				MK_calendar INNER JOIN
				MK_calManager ON MK_calendar.number = MK_calManager.number AND
				MK_calendar.companyID = MK_calManager.companyID
			WHERE
				MK_calManager.companyID = @companyID AND
				MK_calendar.number = @calID AND
				MK_calendar.calYmd >= @ymdA AND
				MK_calendar.calYmd <= @ymdB
			GROUP BY
				MK_calendar.calYmd,
				MK_calendar.holiday
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200609]
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @staffID nvarchar(20),
  @companyID nvarchar(4)  
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング9：勤怠情報が存在する日の最大勤怠Noの取得
			SELECT
				ymd,
				max(kintaiNo) AS kintaiMax
			FROM
				MK_kintai
			WHERE
				MK_kintai.ymd >=@ymdA AND
				MK_kintai.ymd <=@ymdB AND
				MK_kintai.staffID = @staffID AND
				MK_kintai.companyID =@companyID
			GROUP BY
				ymd
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200610]
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング10：個人の締日を取得
            SELECT
                ISNULL(MK_pattern.endDate, '') AS endDate
            FROM MK_staff
                INNER JOIN MK_pattern ON
                 MK_staff.patternNo = MK_pattern.patternNo AND
                 MK_staff.companyID = MK_pattern.companyID
            WHERE
                 MK_staff.staffID=@staffID AND
                 MK_staff.companyID=@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200612]
  @staffID nvarchar(20),
  @copanyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング12：スタッフテーブルから入社日・退職日を取得する
			SELECT
				retireDate,
				entDate
			FROM
				MK_staff
			WHERE
			  staffID=@staffID AND
			  companyID=@copanyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200614]
  @staffID nvarchar(20),
  @copanyID nvarchar(4),
  @dakokuYmd nvarchar(10),
  @kintaiNo int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング14：GPS打刻情報の取得
			SELECT
				ISNULL(inOffice, '') AS inOffice,
				ISNULL(outOffice, '') AS outOffice,
				ISNULL(inPosition, '') AS inPosition,
				ISNULL(inPositionAdd, '') AS inPositionAdd,
				ISNULL(outPosition, '') AS outPosition,
				ISNULL(outPositionAdd, '') AS outPositionAdd,
				ISNULL(inPointNo,'')AS inPointNo,
				ISNULL(outPointNo,'')AS outPointNo
			FROM
				MK_kintai
			WHERE
				companyID = @copanyID AND
				staffID = @staffID AND
				ymd = @dakokuYmd AND
				kintaiNo = @kintaiNo
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200616]
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @companyID nvarchar(4),
  @name nvarchar(21),
  @shozoku nvarchar(2),
  @kubun nvarchar(2),
  @pattern nvarchar(max),
  @sime nvarchar(2)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング16：リストの取得
		DECLARE @varSQL VARCHAR(max)
		
		DECLARE @nameSQL VARCHAR(max)
		IF @name <> ''
		   SET @nameSQL = 'MK_staff.name LIKE ''%'+ @name +'%'' AND '
		ELSE
		   SET @nameSQL = ''
		
		DECLARE @shozokuSQL VARCHAR(max)
		IF @shozoku = ''
		   SET @shozokuSQL ='MK_staff.postID LIKE ''%%'' AND '
		ELSE
		   SET @shozokuSQL = 'MK_staff.postID ='''+@shozoku+''' AND '

		DECLARE @kubunSQL VARCHAR(max)
		IF @kubun = ''
		   SET @kubunSQL = ' MK_staff.kubun LIKE ''%%'' AND '
		ELSE
		   SET @kubunSQL = ' MK_staff.kubun = '''+@kubun+''' AND '

		DECLARE @patternSQL VARCHAR(max)
		IF @pattern = ''
		   SET @patternSQL = 'MK_staff.patternNo LIKE ''%%'' AND '
		ELSE
		   SET @patternSQL = 'MK_staff.patternNo ='''+@pattern+''' AND '

		DECLARE @simeSQL VARCHAR(max)
		IF @sime = ''
		   SET @simeSQL ='MK_pattern.endDate LIKE ''%%'' AND '
		ELSE
		   SET @simeSQL ='MK_pattern.endDate ='''+@sime+''' AND '

        SET @varSQL=
			'SELECT '+
			'    MK_staff.staffID, '+
			'    MK_staff.name, '+
			'    MK_staff.patternNo, '+
			'    ISNULL(MK_kubun.kubunName, '''') AS kubunName, '+
			'    ISNULL(MK_post.postName  , '''') AS postName '+
		    'FROM '+
			'    MK_staff '+
			'    LEFT OUTER JOIN MK_kubun '+
			'    ON MK_staff.kubun=MK_kubun.kubun AND '+
			'    MK_staff.companyID=MK_kubun.companyID '+
		    '    LEFT OUTER JOIN MK_post '+
			'    ON MK_staff.postID=MK_post.postID AND '+
			'    MK_staff.companyID=MK_post.companyID '+
			'    LEFT OUTER JOIN MK_pattern ON '+
            '    MK_staff.patternNo=MK_pattern.patternNo AND '+ 
			'    MK_staff.companyID=MK_pattern.companyID '+
		    'WHERE '+
			'    MK_staff.entDate<='''+ @ymdA+ '''AND '+
			'   (MK_staff.retireDate='''' OR MK_staff.retireDate IS NULL OR '+
		    '    MK_staff.retireDate>='''+@ymdA+''') AND '+
			@nameSQL +
			@shozokuSQL +
			@kubunSQL +
			@patternSQL +
			@simeSQL +
			'    MK_staff.companyID='''+@companyID+''' '+
            'ORDER BY '+
			'    MK_pattern.endDate, MK_staff.staffID'

		--SQL実行
			EXEC (@varSQL)
        
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200617]
  @companyID nvarchar(4),
  @ymdA nvarchar(10),
  @staffID nvarchar(20)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		    -- マッピング17：前のスタッフ情報の取得
		   SELECT
				staffID
			FROM MK_staff
			WHERE
				companyID=@companyID AND
				entDate<=@ymdA AND
				staffID=@staffID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

create PROCEDURE [dbo].[ver_2_5_200618]
  @companyID nvarchar(4),
  @ymdB nvarchar(10),
  @staffID nvarchar(20)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング18：次のスタッフ情報の取得
			SELECT
				staffID
			FROM MK_staff
			WHERE
				companyID=@companyID AND
				(
					retireDate='' OR
					retireDate IS NULL OR
					retireDate>=@ymdB
				) AND
				staffID=@staffID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200619]
--パラメーター
  @kintaiNo int,
  @inOffice float,
  @outOffice float,
  @restTime float,
  @inTime float,
  @underTime float,
  @overTime float,
  @outTime float,
  @maruInOffice float,
  @maruOutOffice float,
  @midnight float,
  @ymd nvarchar(10),
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：19 勤怠データの更新
			UPDATE MK_kintai											
			 SET											
				kintaiNo = @kintaiNo,										
				inOffice = @inOffice,										
				outOffice = @outOffice,										
				restTime = @restTime,										
				inTime = @inTime,										
				underTime = @underTime,										
				overTime = @overTime,										
				outTime = @outTime,										
				maruInOffice = @maruInOffice,										
				maruOutOffice = @maruOutOffice,										
				midnight = @midnight
			 WHERE											
				staffID = @staffID AND				
				ymd = @ymd AND
				kintaiNo = @kintaiNo AND
				companyID = @companyID

			--    追加、更新したテーブルを表示(確認用）
			SELECT * FROM MK_kintai			
            WHERE companyID = @companyID AND 
				  staffID = @staffID AND
				  ymd = @ymd
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200620]
  @patternNo int,
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング20：タイムテーブルの取得(休憩開始～終了時間のタイムテーブル)
            SELECT
                timeTableNo,
                startRest,
                endRest
            FROM MK_timeTable
            WHERE
                patternNo=@patternNo AND
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200621]
  @kintaiNo int,
  @inOffice float,
  @outOffice float,
  @restTime float,
  @inTime float,
  @underTime float,
  @overTime float,
  @outTime float,
  @maruInOffice float,
  @maruOutOffice float,
  @midnight float,
  @ymd nvarchar(10),
  @staffID nvarchar(20),
  @companyID nvarchar(4),
  @week nvarchar(2)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		DECLARE @kintaiCount int
            -- マッピング21：DB存在チェック
            SELECT
               @kintaiCount= COUNT(ymd)
            FROM MK_kintai
            WHERE
                kintaiNo=@kintaiNo AND
                staffID=@staffID AND
                ymd=@ymd AND
                companyID=@companyID

			-- DBに勤怠データが存在する時
			BEGIN
			IF @kintaiCount > 0
				EXEC ver_2_5_200619 @kintaiNo,
								   @inOffice,
								   @outOffice,
				                   @restTime,
								   @inTime,
								   @underTime,
								   @overTime,
								   @outTime,
								   @maruInOffice,
								   @maruOutOffice,
								   @midnight,
								   @ymd,
								   @staffID,
								   @companyID
			ELSE
				--勤怠データが無い時は新規登録
				INSERT INTO MK_kintai(
					staffID,										
					ymd,										
					kintaiNo,										
					youbi,										
					inOffice,										
					outOffice,										
					restTime,										
					inTime,										
					underTime,										
					overTime,										
					outTime,										
					maruInOffice,										
					maruOutOffice,										
					companyID,									
					midnight										
				 )										
				 VALUES(
					@staffID,			
					@ymd,
					@kintaiNo,
					@week,										
					@inOffice,
					@outOffice,
					@restTime,
					@inTime,
					@underTime,
					@overTime,
					@outTime,
					@maruInOffice,
					@maruOutOffice,
					@companyID,
					@midnight
				)									
			END
			--    追加、更新したテーブルを表示(確認用）
			SELECT * FROM MK_kintai			
            WHERE companyID = @companyID AND 
				  staffID = @staffID AND
				  ymd = @ymd
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200622]
--パラメーター
 @staffID nvarchar(20),
 @ymd nvarchar(10),
 @kintaiNo int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 勤怠データの削除
			DELETE MK_kintai								
			 WHERE								
				staffID = @staffID AND
				ymd= @ymd AND
				kintaiNo= @kintaiNo AND
				companyID = @companyID

			--   削除したテーブルを表示(確認用）
			SELECT * FROM MK_kintai			
			 WHERE								
				staffID = @staffID AND
				ymd= @ymd AND
				kintaiNo= @kintaiNo AND
				companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200624]
  @companyID nvarchar(4),
  @staffID nvarchar(20),
  @ymdSun nvarchar(10),
  @ymdA nvarchar(10)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング24：先頭日曜日からymdAの前日までのinTimeとoverTimeの合計を取得
		    SELECT
                SUM(inTime + overTime) AS preTime
            FROM
                MK_kintai
            WHERE
                companyID = @companyID AND
                staffID = @staffID AND
                ymd >= @ymdSun AND
                ymd < @ymdA
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200625]
  @companyID nvarchar(4),
  @staffID nvarchar(20),
  @ymdB nvarchar(10),
  @ymdSat nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング25：先月締日の翌日～当月締日の週の土曜日までの明細データを取得
			SELECT
				ymd,
				kintaiNo,
				youbi,
				inOffice,
				maruInOffice,
				outOffice,
				maruOutOffice,
				restTime,
				underTime,
				inTime,
				outTime,
				overTime,
				midnight
			FROM
				MK_kintai
			WHERE
				companyID = @companyID AND
				staffID = @staffID AND
				ymd > @ymdB AND
				ymd <= @ymdSat
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200626]
  @ymdA nvarchar(10),
  @ymdB nvarchar(10),
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：申請データの取得
			SELECT 									
				MK_sinsei.taishouDate,								
				MK_todokede.todokedeName,								
				MK_sinsei.todokedeID,
				MK_sinsei.shoninFlag				
			FROM									
				MK_sinsei INNER JOIN								
				MK_todokede ON 								
				MK_sinsei.todokedeID = MK_todokede.todokedeID AND 								
				MK_sinsei.companyID = MK_todokede.companyID								
			WHERE									
				(MK_sinsei.companyID = @companyID) AND 								
				(MK_sinsei.sinseiStaffID = @staffID) AND								
				(MK_sinsei.taishouDate BETWEEN @ymdA AND @ymdB) AND								
				(MK_sinsei.shoninFlag < 2)								
			END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200627]
  @kintaiNo int,
  @ymd nvarchar(10),
  @staffID nvarchar(20),
  @companyID nvarchar(4),
  @address nvarchar(max),
  @deiriHantei int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：住所情報の更新
			BEGIN
			IF @deiriHantei < 1
				UPDATE 
					MK_kintai
				SET			
					inPositionAdd = @address
				WHERE
                kintaiNo=@kintaiNo AND
                staffID=@staffID AND
                ymd=@ymd AND
                companyID=@companyID
			ELSE
				UPDATE 
					MK_kintai
				SET			
					outPositionAdd = @address
				WHERE
                kintaiNo=@kintaiNo AND
                staffID=@staffID AND
                ymd=@ymd AND
                companyID=@companyID										
			END
		END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200628]
  @kintaiNo int,
  @ymd nvarchar(10),
  @staffID nvarchar(20),
  @companyID nvarchar(4),
  @pointNo int,
  @deiriHantei int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：打刻場所名称Noの更新
			BEGIN
			IF @deiriHantei < 1
				UPDATE 
					MK_kintai
				SET			
					inPointNo = @pointNo
				WHERE
                kintaiNo=@kintaiNo AND
                staffID=@staffID AND
                ymd=@ymd AND
                companyID=@companyID
			ELSE
				UPDATE 
					MK_kintai
				SET			
					outPointNo = @pointNo
				WHERE
                kintaiNo=@kintaiNo AND
                staffID=@staffID AND
                ymd=@ymd AND
                companyID=@companyID										
			END
		END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

Create PROCEDURE [dbo].[ver_2_5_200701]
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		    -- マッピング1：会社情報の取得
		    SELECT
                name,
                presTime,
                presFlag
            FROM MK_company
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200702]
  @companyID nvarchar(4),
  @name nvarchar(21),
  @staffID nvarchar(20),
  @shozoku nvarchar(2),
  @kubun nvarchar(2),
  @pattern nvarchar(max),
  @sime nvarchar(2)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		    -- マッピング2：印刷対象スタッフリストの取得
			DECLARE @varSQL VARCHAR(max)
		
			DECLARE @nameSQL VARCHAR(max)
			IF @staffID <> ''
			   SET @nameSQL = 'MK_staff.staffID = '''+ @staffID +''' AND'
			ELSE
			   SET @nameSQL = 'MK_staff.name LIKE ''%'+ @name +'%'' AND '
		
			DECLARE @shozokuSQL VARCHAR(max)
			IF @shozoku = ''
			   SET @shozokuSQL ='MK_staff.postID LIKE ''%%'' AND '
			ELSE
			   SET @shozokuSQL = 'MK_staff.postID ='''+@shozoku+''' AND '

			DECLARE @kubunSQL VARCHAR(max)
			IF @kubun = ''
			   SET @kubunSQL = ' MK_staff.kubun LIKE ''%%'' AND '
			ELSE
			   SET @kubunSQL = ' MK_staff.kubun = '''+@kubun+''' AND '

			DECLARE @patternSQL VARCHAR(max)
			IF @pattern = ''
			   SET @patternSQL = 'MK_staff.patternNo LIKE ''%%'' AND '
			ELSE
			   SET @patternSQL = 'MK_staff.patternNo ='''+@pattern+''' AND '

			DECLARE @simeSQL VARCHAR(max)
			IF @sime = ''
			   SET @simeSQL ='MK_pattern.endDate LIKE ''%%'' AND '
			ELSE
			   SET @simeSQL ='MK_pattern.endDate ='''+@sime+''' AND '

		    SET @varSQL=
					'SELECT '+
			        '    MK_staff.staffID, '+
					'    MK_staff.name, '+
					'    MK_post.postID, '+
					'    MK_kubun.kubun AS koyou, '+
					'    ISNULL(MK_kubun.kubunName, '''')AS kubun, '+
                    '    ISNULL(MK_post.postName, '''')AS syozoku, '+
					'    MK_staff.patternNo, '+
					'    ISNULL(MK_pattern.endDate, '''') AS endDate, '+
					'    MK_pattern.startWork, '+
					'    MK_pattern.endWork, '+
					'    MK_pattern.startMarume, '+
					'    MK_pattern.endMarume '+
					'FROM '+
					'    MK_staff '+
					'    LEFT OUTER JOIN MK_kubun ON '+
					'    MK_staff.kubun = MK_kubun.kubun AND '+
					'    MK_staff.companyID = MK_kubun.companyID '+
					'    LEFT OUTER JOIN MK_post ON '+
					'    MK_staff.postID = MK_post.postID AND '+
					'    MK_staff.companyID = MK_post.companyID '+
					'    INNER JOIN MK_pattern ON '+
					'    MK_staff.patternNo = MK_pattern.patternNo AND '+
					'    MK_staff.companyID = MK_pattern.companyID '+
					'WHERE ' +
					@shozokuSQL +
					@kubunSQL + 
					@patternSQL + 
					@simeSQL + 
					@nameSQL + 
					'    MK_staff.companyID='''+@companyID+''' '

			--SQL実行
			EXEC (@varSQL)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200703]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：集計部合計値取得
		    SELECT DISTINCT
				 MK_kintai.staffID,
			 	 MK_staff.postID,
			 	 MK_staff.kubun,
				 SUM(CASE WHEN MK_kintai.overTime > 0 then 1 ELSE 0 END) AS outTimeDay,
				 ISNULL(SUM(MK_kintai.underTime),'') AS underTime,
				 ISNULL(SUM(MK_kintai.inTime),'') AS inTime,
				 ISNULL(SUM(MK_kintai.outTime),'') AS outTime,
				 ISNULL(SUM(MK_kintai.overTime),'') AS overTime,
				 ISNULL(SUM(MK_kintai.midnight),'') AS nightTime
			FROM MK_kintai
			     INNER JOIN MK_staff ON
			 	 MK_kintai.staffID = MK_staff.staffID AND
				 MK_kintai.companyID = MK_staff.companyID
			WHERE
	 			 MK_kintai.ymd >=@ymdA AND
				 MK_kintai.ymd <=@ymdB AND
				 MK_kintai.staffID = @staffID AND
				 MK_kintai.companyID=@companyID
			GROUP BY
				 MK_kintai.staffID,
				 MK_staff.postID,
				 MK_staff.kubun

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200704]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：集計部出勤日数取得
			SELECT
				COUNT( MK_kintai.kintaiNo) AS kinmuDay
			FROM MK_kintai
			WHERE
				MK_kintai.kintaiNo = 0 AND
				MK_kintai.ymd >= @ymdA AND
				MK_kintai.ymd <= @ymdB AND
				MK_kintai.staffID = @staffID AND
				MK_kintai.companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200705]
--パラメーター
 @companyID nvarchar(4),
 @staffID nvarchar(20)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：対象スタッフの休日カレンダー番号を取得する
			SELECT
				calendarID
			FROM MK_staff
			WHERE
				companyID = @companyID AND
				staffID = @staffID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200706]
--パラメーター
 @companyID nvarchar(4),
 @calID int,
 @staffID nvarchar(20),
 @ymdA nvarchar(10),
 @ymdB nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6： 休日勤務日の勤怠データを取得
			SELECT
				MK_calendar.calYmd,
				ISNULL(SUM(MK_kintai.inTime),'') AS inTimeSum,
				ISNULL(SUM(MK_kintai.underTime),'') AS underTimeSum,
				ISNULL(SUM(MK_kintai.overTime),'') AS overTimeSum
			FROM MK_calendar
			INNER JOIN MK_calManager ON
				MK_calendar.number = MK_calManager.number AND
				MK_calendar.companyID = MK_calManager.companyID
			INNER JOIN MK_kintai ON
				MK_calendar.calYmd = MK_kintai.ymd AND
				MK_calendar.companyID = MK_kintai.companyID
			WHERE
				MK_calManager.companyID = @companyID AND
				MK_calendar.number = @calID AND
				MK_kintai.staffID = @staffID AND
				MK_calendar.calYmd >= @ymdA AND
				MK_calendar.calYmd <= @ymdB
			GROUP BY
				MK_calendar.calYmd
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200707]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @staffID nvarchar(21),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング7：明細部のリスト取得
			SELECT
				ymd,
				kintaiNo,
				youbi,
				ISNULL(inOffice, '') AS inOffice,
				outOffice,
				restTime,
				ISNULL(underTime, '') AS underTime,
				ISNULL(overTime, '') AS overTime,
				ISNULL(inTime, '') AS inTime,
				ISNULL(outTime, '') AS outTime,
				ISNULL((underTime + outTime + overTime), '') AS totalRoudou,
				ISNULL(maruInOffice, '') AS maruInOffice,
				ISNULL(maruOutOffice, '') AS maruOutOffice
			FROM MK_kintai
			WHERE
				MK_kintai.ymd >=@ymdA AND
				MK_kintai.ymd <=@ymdB AND
				MK_kintai.staffID = @staffID AND
				MK_kintai.companyID =@companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200901]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：就業規則設定の取得
           SELECT
                name,
                presTime,
                presFlag
            FROM MK_company
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200902]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：基本パターンの締日取得
		    SELECT endDate
            FROM MK_pattern
            WHERE
                companyID=@companyID AND
                patternNo=0

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200903]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：所属部署の取得
            SELECT
               ISNULL(MK_post.postName,'') AS
               postName,
               MK_post.postID
            FROM MK_post
            WHERE
               companyID=@companyID
            ORDER BY
               MK_post.postName ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200904]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：雇用形態の取得
            SELECT
                ISNULL(MK_kubun.kubunName,'') AS kubunName,
                MK_kubun.kubun
            FROM MK_kubun
            WHERE
                companyID=@companyID
            ORDER BY
                MK_kubun.kubunName ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200905]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：勤務パターンの取得
            SELECT
                ISNULL(MK_pattern.memo,'') AS patternName,
                MK_pattern.patternNo
            FROM MK_pattern
            WHERE
                companyID=@companyID
            ORDER BY
                MK_pattern.memo ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200906]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：社員名検索リストの取得
            SELECT
                name
            FROM MK_staff
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





SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200907]
--パラメーター
@todayFlag int,
@nowDay nvarchar(10),
@post nvarchar(2),
@kubun nvarchar(2),
@pattern nvarchar(max),
@ymdA nvarchar(10),
@ymdB nvarchar(10),
@name nvarchar(21),
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング7：明細リスト取得
			DECLARE @varSQL VARCHAR(max)
			DECLARE @sqlEND VARCHAR(max)
			DECLARE @sToday VARCHAR(max)
			SET @sToday =''
			DECLARE @sPost VARCHAR(max)
			SET @sPost =''
			DECLARE @sKubun VARCHAR(max)
			SET @sKubun = ''
			DECLARE @sPattern VARCHAR(max)
			SET @sPattern = ''

			--パラメターの条件によって絞込みを変更する
			if @todayFlag = 0 
				SET @sToday = ' AND MK_kintai.ymd<>''' + @nowDay + ''''

			if @post<> ''
				SET @sPost = ' AND MK_post.postID =''' + @post + ''''

			if @kubun<> ''
				SET @sKubun = ' AND MK_kubun.kubun ='''+ @kubun +''''
    
			if @pattern<>''
				SET @sPattern = ' AND MK_pattern.patternNo ='''+ @pattern + ''''

			SET @varSQL=
				'SELECT '+
				'    MK_kintai.staffID, '+
				'    MK_kintai.ymd, '+
				'    MK_staff.name '+
				' FROM '+
				'    MK_kintai '+
				'    INNER JOIN MK_staff ON '+
				'    MK_kintai.staffID = MK_staff.staffID AND '+
				'    MK_kintai.companyID = MK_staff.companyID '+
				'    INNER JOIN MK_kubun ON '+
				'    MK_staff.kubun = MK_kubun.kubun AND '+
				'    MK_staff.companyID = MK_kubun.companyID '+
				'    INNER JOIN MK_post ON '+
				'    MK_staff.postID = MK_post.postID AND '+
				'    MK_staff.companyID = MK_post.companyID '+
				'    INNER JOIN MK_pattern ON '+
				'    MK_staff.patternNo = MK_pattern.patternNo AND '+
				'    MK_staff.companyID = MK_pattern.companyID '+
				' WHERE '+
				'    MK_kintai.ymd>='''+@ymdA+''' AND '+
				'    MK_kintai.ymd<='''+@ymdB+''' '+
                @sToday+ 'AND '+
				'    ISNULL(MK_kintai.outOffice, '''')='''' AND '+
                '    MK_staff.name LIKE N''%'+@name+'%'' '+
                @sPost +
				@sKubun +
				@sPattern+' AND '+
				'    MK_kintai.companyID=''' + @companyID + ''''
			
			--SQL実行
			EXEC (@varSQL)
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





SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_200908]
--パラメーター
@staffName nvarchar(21),
@staffID nvarchar(20),
@kintaiYmd nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング8：明細リスト詳細の取得
			SELECT             MK_kintai.staffID,
				MK_kintai.ymd,
				MK_kintai.kintaiNo,
				ISNULL(MK_kintai.inOffice, '') AS inOffice,
				ISNULL(MK_kintai.maruInOffice,'') AS maruInOffice,
				ISNULL(MK_kintai.outOffice, '') AS outOffice,
				ISNULL(maruOutOffice, '') AS maruOutOffice,
				ISNULL(MK_kintai.restTime, '') AS restTime,
				ISNULL(MK_kintai.inTime,'') AS inTime,
				ISNULL(MK_kintai.underTime,'') AS underTime,
				ISNULL(MK_kintai.overTime, '') AS overTime,
				ISNULL(MK_kintai.outTime, '') AS outTime,
				MK_staff.name,
				MK_kubun.kubunName,
				MK_post.postName,
				MK_pattern.patternNo,
				MK_pattern.startWork,
				MK_pattern.startMarume,
				MK_pattern.endMarume
			FROM MK_kintai
			INNER JOIN MK_staff ON
				MK_kintai.staffID = MK_staff.staffID AND
				MK_kintai.companyID = MK_staff.companyID
			INNER JOIN MK_kubun ON
				MK_staff.kubun = MK_kubun.kubun AND
				MK_staff.companyID = MK_kubun.companyID
			INNER JOIN MK_post ON
				MK_staff.postID = MK_post.postID AND
				MK_staff.companyID = MK_post.companyID
			INNER JOIN MK_pattern ON
				MK_staff.patternNo = MK_pattern.patternNo AND
				MK_staff.companyID = MK_pattern.companyID
			WHERE  MK_staff.name = @staffName AND
                   MK_staff.staffID= @staffID AND
                   MK_kintai.ymd= @kintaiYmd
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_2010_301]
--パラメーター

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：給与出力項目の取得
            SELECT
                masterNo,
                masterName
            FROM MK_salaryItem
            WHERE
                masterNo > 0
            ORDER BY
                displayOrder
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_2010_302]
--パラメーター

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：基本フォーマット項目の取得
            SELECT
                masterNo,
                masterName,
                formatName
            FROM MK_csvMaster
            WHERE
                masterNo > 0
            ORDER BY
                displayOrder
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_2010_303]
--パラメーター
 @companyID nvarchar(4),
 @patternNo int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：設定済み項目の取得
            SELECT MK_csvFormat.masterNo,
			       CASE WHEN MK_csvFormat.settingName = MK_salaryItem.masterName 
                   THEN MK_salaryItem.masterName ELSE MK_salaryItem.masterName + N'(' + MK_csvFormat.settingName + N')' END AS settingName,
                   MK_csvFormat.formatName,
				   MK_csvFormat.itemOutput, 
				   MK_csvFormat.timeFormat, 
				   MK_csvFormat.displayFormat, 
				   MK_csvFormat.totalUnit 
            FROM MK_csvFormat 
			     INNER JOIN MK_salaryItem ON MK_csvFormat.masterNo = MK_salaryItem.masterNo
            WHERE MK_csvFormat.companyID= @companyID  AND
			      MK_csvFormat.patternNo= @patternNo
            ORDER BY MK_csvFormat.displayOrder
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_2010_304]
--パラメーター
 @patternNo int,
 @formatName nvarchar(50),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：設定名存在チェック
            SELECT
                *
            FROM MK_csvFormat
            WHERE
                patternNo <> @patternNo AND
                formatName = @formatName AND
                companyID= @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_2010_305]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：新規パターンNoの取得
            SELECT
                ISNULL(MAX(patternNo)+1,'100') AS patternMax
            FROM MK_csvFormat
            WHERE
                companyID= @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_2010_306]
--パラメーター
 @companyID nvarchar(4),
 @patternNo int,
 @masterNo int,
 @orderNo int,
 @settingName nvarchar(50),
 @formatName nvarchar(50),
 @itemOutput int,
 @timeFormat int,
 @displayFormat int,
 @totalUnit int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 新規項目の登録
			INSERT INTO MK_csvFormat (									
				companyID, 								
				patternNo,								
				masterNo, 								
				displayOrder,								
				settingName, 								
				formatName,								
				itemOutput, 								
				timeFormat, 								
				displayFormat, 								
				totalUnit)								
			VALUES (									
				@companyID,								
				@patternNo,								
				@masterNo,								
				@orderNo,								
				@settingName,								
				@formatName,								
				@itemOutput,								
				@timeFormat,								
				@displayFormat,								
				@totalUnit
			)								
			--   追加したテーブルを表示(確認用）
			SELECT * FROM MK_csvFormat			
			 WHERE								
				companyID = @companyID AND
				patternNo = @patternNo AND
				masterNo = @masterNo
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_2010_307]
--パラメーター
 @companyID nvarchar(4),
 @patternNo int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 項目の削除
			DELETE MK_csvFormat				
			WHERE			
				companyID = @companyID AND		
				patternNo = @patternNo
	
			--   削除したテーブルを表示(確認用）
			SELECT * FROM MK_csvFormat			
			 WHERE								
				companyID = @companyID AND
				patternNo = @patternNo
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201001]
--パラメーター

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：基本フォーマットの取得
			 SELECT
				 masterNo,
				 masterName,
				 formatName
			 FROM MK_csvMaster
			 WHERE
				 masterNo>0
			 ORDER BY
				 displayOrder
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201002]
--パラメーター
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：勤怠パターンの締日を取得する
			SELECT
				endDate
			FROM
				MK_pattern
			WHERE
				companyID= @companyID AND
				patternNo=0

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201003]
--パラメーター
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：所属部署情報を取得
			SELECT
				ISNULL(MK_post.postName,'') AS postName,
				MK_post.postID
			FROM MK_post
			WHERE
				companyID= @companyID
			ORDER BY
				MK_post.postName ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201004]
--パラメーター
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：雇用形態情報の取得
			SELECT
				ISNULL(MK_kubun.kubunName,'') AS kubunName,
				MK_kubun.kubun
			FROM MK_kubun
			WHERE
				companyID= @companyID
			ORDER BY
				MK_kubun.kubunName ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201005]
--パラメーター
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：スタッフ氏名の取得
			SELECT
				name
			FROM MK_staff
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201006]
--パラメーター
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：csvフォーマットの取得
			SELECT
				patternNo,
				formatName
			 FROM MK_csvFormat
			 WHERE
			    companyID= @companyID
			 UNION
			 SELECT
				patternNo,
				formatName
			 FROM MK_csvMaster
			 ORDER BY patternNo DESC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201007]
--パラメーター
@companyID nvarchar(4),
@outFormat int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング7：CSVの出力項目の取得
            SELECT
                MK_csvFormat.masterNo,
                CASE WHEN MK_csvFormat.settingName=MK_salaryItem.masterName THEN MK_salaryItem.masterName 
				ELSE MK_salaryItem.masterName + N'(' + MK_csvFormat.settingName + N')' END AS settingName,
                MK_csvFormat.formatName,
                MK_csvFormat.itemOutput,
                MK_csvFormat.timeFormat,
                MK_csvFormat.displayFormat,
                MK_csvFormat.totalUnit
            FROM MK_csvFormat
            INNER JOIN MK_salaryItem ON
                MK_csvFormat.masterNo=MK_salaryItem.masterNo
            WHERE
                MK_csvFormat.companyID=@companyID AND
                MK_csvFormat.patternNo=@outFormat
            ORDER BY
                MK_csvFormat.displayOrder
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201009]
--パラメーター
@blankName nvarchar(max),
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング9：氏名存在チェック
            SELECT
                name
            FROM MK_staff
            WHERE
               name LIKE '%'+@blankName+'%' AND
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201010]
--パラメーター
@ymdA nvarchar(10),
@ymdB nvarchar(10),
@sPost nvarchar(2),
@ePost nvarchar(2),
@sKubun nvarchar(2),
@eKubun nvarchar(2),
@blankName nvarchar(21),
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング10：打刻漏れエラーチェック
			SELECT
				MK_kintai.staffID,
				MK_kintai.ymd,
				ISNULL(max(MK_kintai.maruoutOffice),'0') AS maruoutOffice,
				ISNULL(max(MK_kintai.outOffice),'0') AS outOffice
			FROM MK_kintai
			INNER JOIN MK_staff ON
				MK_kintai.staffID=MK_staff.staffID AND
				MK_kintai.companyID=MK_staff.companyID
			INNER JOIN
				MK_post ON
				MK_staff.postID=MK_post.postID AND
				MK_staff.companyID=MK_post.companyID
			INNER JOIN MK_pattern ON
				MK_staff.patternNo=MK_pattern.patternNo AND
				MK_staff.companyID=MK_pattern.companyID
			INNER JOIN MK_kubun ON
				MK_staff.kubun=MK_kubun.kubun AND
				MK_staff.companyID=MK_kubun.companyID
			WHERE
				MK_kintai.ymd BETWEEN @ymdA AND @ymdB AND
				MK_post.postID BETWEEN @sPost AND @ePost AND
				MK_kubun.kubun BETWEEN @sKubun AND @eKubun AND
				MK_staff.name LIKE '%'+@blankName+'%' AND
				MK_kintai.companyID=@companyID
			GROUP BY
				MK_kintai.staffID,
				MK_kintai.ymd
			ORDER BY
				MK_kintai.staffID ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201011]
--パラメーター
@ymdA nvarchar(10),
@ymdB nvarchar(10),
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング11：未確認申請データの存在チェック
			SELECT
			*
			FROM MK_sinsei
			WHERE
			   shoninFlag=0 AND
			   companyID=@companyID AND
			   taishouDate BETWEEN @ymdA AND @ymdB
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201012]
--パラメーター
@ymdA nvarchar(10),
@ymdB nvarchar(10),
@sPost nvarchar(2),
@ePost nvarchar(2),
@sKubun nvarchar(2),
@eKubun nvarchar(2),
@blankName nvarchar(21),
@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング12：対象のスタッフ情報を取得
            SELECT
                DISTINCT(MK_staff.staffID),
                MK_staff.postID,
                MK_staff.kubun,
                MK_staff.patternNo,
                MK_staff.calendarID
            FROM MK_kintai
            INNER JOIN MK_staff ON
                MK_kintai.staffID=MK_staff.staffID AND
                MK_kintai.companyID=MK_staff.companyID
            INNER JOIN MK_post ON
                MK_staff.postID=MK_post.postID AND
                MK_staff.companyID=MK_post.companyID
            INNER JOIN MK_pattern ON
                MK_staff.patternNo=MK_pattern.patternNo AND
                MK_staff.companyID=MK_pattern.companyID
            INNER JOIN MK_kubun ON
                MK_staff.kubun=MK_kubun.kubun AND
                MK_staff.companyID=MK_kubun.companyID
            WHERE
                MK_kintai.ymd BETWEEN @ymdA AND @ymdB AND
                MK_kintai.companyID=@companyID AND
                MK_post.postID BETWEEN @sPost AND @ePost AND
                MK_kubun.kubun BETWEEN @sKubun AND @eKubun AND
                MK_staff.name LIKE '%'+@blankName+'%'
            ORDER BY
                MK_staff.staffID ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201013]
--パラメーター
@ymdA nvarchar(10),
@ymdB nvarchar(10),
@sPost nvarchar(2),
@ePost nvarchar(2),
@sKubun nvarchar(2),
@eKubun nvarchar(2),
@staffID nvarchar(20),
@companyID nvarchar(4),
@strSQL varchar(max)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング13：勤務時間 残業時間 深夜残業の取得
			DECLARE @varSQL VARCHAR(max)
            SET @varSQL =
                'SELECT'+
                    ' MK_kintai.staffID,'+
                    ' MK_kintai.ymd,'+
                    ' SUM(ISNULL(MK_kintai.underTime,0)) AS underTime,'+
                    ' SUM(ISNULL(MK_kintai.overTime,0)) AS overTime,'+
                    ' SUM(ISNULL(MK_kintai.outTime,0)) AS outTime,'+
                    ' SUM(ISNULL(MK_kintai.midnight,0)) AS midnight'+
                ' FROM MK_kintai'+
                ' INNER JOIN MK_staff ON'+
                    ' MK_kintai.staffID=MK_staff.staffID AND'+
                    ' MK_kintai.companyID=MK_staff.companyID'+
                ' INNER JOIN MK_post ON'+
                    ' MK_staff.postID=MK_post.postID AND'+
                    ' MK_staff.companyID=MK_post.companyID'+
                ' INNER JOIN MK_kubun ON'+
                    ' MK_staff.kubun=MK_kubun.kubun AND'+
                    ' MK_staff.companyID=MK_kubun.companyID'+
                ' WHERE'+
				    ' MK_kintai.ymd BETWEEN '''+@ymdA+''' AND '''+@ymdB+''' AND'+
                    ' MK_kintai.companyID= '''+@companyID+''' AND'+
                    ' MK_kintai.staffID = '''+@staffID+''' AND'+
                    ' MK_post.postID BETWEEN '''+@sPost+''' AND '''+@ePost+''' AND'+
                    ' MK_kubun.kubun BETWEEN '''+@sKubun+''' AND '''+@eKubun +''''+
					@strSQL +
                ' GROUP BY'+
                    ' MK_kintai.staffID,'+
                    ' MK_kintai.ymd'
			--SQL実行
			EXEC (@varSQL)
		END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
 PRINT @varSQL
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201014]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @companyID nvarchar(4),
 @calID int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング14：休日設定の取得
            SELECT
                DISTINCT MK_calendar.calYmd
            FROM MK_calendar
                INNER JOIN MK_calManager ON
                 MK_calendar.number=MK_calManager.number AND
                 MK_calendar.companyID=MK_calManager.companyID
            WHERE
                 MK_calendar.calYmd BETWEEN @ymdA AND @ymdB AND
                 MK_calManager.companyID=@companyID AND
                 MK_calendar.number=@calID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201015]
--パラメーター
 @pattern int,
 @companyID nvarchar(4)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング15：個人の勤怠パターンに基づく所定勤務時間の算出
            SELECT
                 MK_pattern.patternNo,
                 MK_pattern.startWork,
                 MK_pattern.endWork,
                 (MK_pattern.endWork - MK_pattern.startWork) AS workTime
            FROM MK_pattern
            WHERE
                 MK_pattern.patternNo=@pattern AND
                 MK_pattern.companyID=@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201016]
--パラメーター
 @pattern int,
 @endWork float,
 @companyID nvarchar(4)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング16：個人の休憩時間を取得する。
            SELECT
                MK_timeTable.timeTableNo,
                MK_timeTable.startRest,
                MK_timeTable.endRest,
                (MK_timeTable.endRest - MK_timeTable.startRest) AS restTime
            FROM MK_timeTable
                INNER JOIN MK_pattern ON
                MK_timeTable.patternNo=MK_pattern.patternNo
            WHERE
                MK_pattern.patternNo=@pattern AND
                MK_timeTable.startRest<@endWork AND
                MK_timeTable.companyID=@companyID AND
                MK_timeTable.timeTableNo<10
            GROUP BY
                MK_timeTable.timeTableNo,
                MK_timeTable.startRest,
                MK_timeTable.endRest,
                MK_timeTable.patternNo
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201101]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：勤怠パターンの締日取得
            SELECT
                endDate
            FROM MK_pattern
            WHERE
                companyID=@companyID AND
                patternNo=0
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201102]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：所属部署の取得
            SELECT
                ISNULL(MK_post.postName,'') AS postName,
                MK_post.postID
            FROM MK_post
            WHERE companyID= @companyID
            ORDER BY MK_post.postName ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201103]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：雇用形態の取得
            SELECT
                ISNULL(MK_kubun.kubunName,'') AS kubunName,
                MK_kubun.kubun
            FROM MK_kubun
            WHERE companyID=@companyID
            ORDER BY MK_kubun.kubunName ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201104]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：社員名の取得
            SELECT
                name
            FROM MK_staff
            WHERE companyID=@companyID
            ORDER BY MK_staff.staffID asc
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201105]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：届出種別の取得
            SELECT
                todokedeID,
                todokedeName
            FROM MK_todokede
            WHERE companyID=@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201106]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：確認する人の取得
            SELECT
                staffID,
                name
            FROM MK_staff
            WHERE
                (admCD < 2) AND
                companyID=@companyID
            ORDER BY
                MK_staff.staffID ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201107]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング7：確認した人の取得
            SELECT
                ST.commitStaffID,
                MK_staff.name
            FROM (
                SELECT 
				DISTINCT ISNULL(commitStaffID, shoninStaffID) AS commitStaffID 
				FROM MK_sinsei 
				WHERE (shoninFlag > 0) AND (companyID = @companyID)) AS ST
             LEFT OUTER JOIN MK_staff ON
                ST.commitStaffID=MK_staff.staffID
            WHERE
                MK_staff.companyID=@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201108]
--パラメーター
 @admCD int,
 @staff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング8：出力期間の取得
			DECLARE @varSQL VARCHAR(max)
			DECLARE @admSQL VARCHAR(max)

            IF @admCD = 1
			   SET @admSQL = 'AND shoninStaffID =''' + @staff + ''''
			ELSE
			   SET @admSQL =''
			
            SET @varSQL = 
					'SELECT '+
					'    MIN(taishouDate) AS kaishiDate, '+
					'    MAX(taishouDate) AS endDate '+
					'FROM '+
					'    MK_sinsei '+
					'WHERE '+
					'    shoninFlag=''0'' AND '+
					'    companyID='''+ @companyID +''''+
			        @admSQL
                
			--SQL実行
			EXEC (@varSQL)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201109]
--パラメーター
 @companyID nvarchar(4),
 @sinseiFlg int,
 @admCD int,
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @staff nvarchar(20),
 @post varchar(2),
 @kubun varchar(2),
 @staffName nvarchar(max),
 @todokede nvarchar(max),
 @status varchar(1),
 @kakuninStaff nvarchar(20),
 @commitStaff nvarchar(20)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング9：リストの取得
			DECLARE @varSQL VARCHAR(max)
			DECLARE @whereSQL VARCHAR(max)

		-- 初期表示時、権限によって条件を変更する
        if @sinseiFlg = 0
            -- 申請一覧ボタンからの遷移
            if @admCD = 0
                -- 全権限の場合            
                SET @whereSQL ='AND (SI.taishouDate BETWEEN N'''+ @ymdA +''' AND N'''+ @ymdB +''') '
             else
                -- 管理者の場合
                SET @whereSQL ='AND (SI.taishouDate BETWEEN N''' + @ymdA + ''' AND N'''+ @ymdB + ''') ' +
                    'AND SI.shoninStaffID=N''' + @staff + ''' '
        else if @sinseiFlg = 1
            -- 未確認件数からのリンクの場合
            if @admCD = 0
                --全権限の場合
                SET @whereSQL ='AND SI.shoninFlag = 0 '
            else 
                -- 管理者の場合
                SET @whereSQL =
                    'AND SI.shoninFlag=0 ' +
                    'AND SI.shoninStaffID=N''' + @staff + ''' '
		else
		-- 検索ボタン押下時、画面の検索条件を取得する
		        SET @whereSQL ='AND (SI.taishouDate BETWEEN N'''+ @ymdA +''' AND N'''+ @ymdB +''') '
			 --所属部署
		     if @post <> ''
                -- 全て以外の場合
				SET @whereSQL += 'AND MK_staff.postID = N''' + @post + ''' '
             -- 雇用形態
             if @kubun <> ''
               -- 全て以外の場合
                SET @whereSQL +='AND MK_staff.kubun = N''' + @kubun + ''' '
			 --	スタッフ氏名
			 if @staffName <> ''
			   -- 全て以外の場合
                SET @whereSQL += 'AND MK_staff.name LIKE N''%' + @staffName + '%'' '
			 -- 届出種類
			 if @todokede = 'dakoku'
			   -- 打刻修正の時
                SET @whereSQL += 'AND SI.todokedeID IS NULL '
               -- 全ての時
              else if @todokede = '' -- 条件なし
			    SET @whereSQL +=''
              else 
               --セレクトボックスの選択した値
				SET @whereSQL +='AND SI.todokedeID =''' + @todokede + ''' ' 
			-- 確認状態
			if @status <> ''
			   --全て以外の場合
                SET @whereSQL += 'AND SI.shoninFlag =''' + @status + ''' '
		-- 確認する人
			if @kakuninStaff <> ''
			   -- 全て以外の場合
                SET @whereSQL += 'AND SI.shoninStaffID =  N''' + @kakuninStaff + ''' '
		-- 確認した人
			if @commitStaff <> 'kuhaku' AND @commitStaff <> ''
			   -- 全てと空白以外の場合
				SET @whereSQL +='AND SI.commitStaffID =  N''' + @commitStaff + ''' '

            SET @varSQL =
			'SELECT '+
                'SI.id, '+
                'ISNULL(TD.labelName, N''打刻修正日'') AS labelName, '+
                'SI.sinseiNo, '+
                'SI.taishouDate, '+
                'sinseiSub.endDate, '+
                'ISNULL(SI.inOffice, N'''') AS inOffice, '+
                'ISNULL(SI.outOffice, N'''') AS outOffice, '+
                'ISNULL(SI.restTime, N'''') AS restTime, '+
                'SI.sinseiStaffID, '+
                'MK_staff.name, '+
                'SI.shoninStaffID, '+
                'ISNULL(kanriST.name,''削除されたスタッフ'') AS kanriName, '+
                'ISNULL(kanriST.email,'''') AS kanriMail, '+
                'ISNULL(SI.commitStaffID, SI.shoninStaffID) AS commitStaffID, '+
                'CASE WHEN SI.commitStaffID=N''delete_staff'' '+
                    'THEN ''削除されたスタッフ'' '+
                'WHEN commitST.staffID IS NULL '+
                    'THEN kanriST.name '+
                'ELSE commitST.name '+
                'END AS commitName, '+
                'ISNULL(SI.sinseiRiyu, N'''') AS sinseiRiyu, '+
                'ISNULL(SI.kyakkaRiyu, N'''') AS kyakkaRiyu, '+
                'SI.kintaiNo, '+
                'SI.sinseiKubun, '+
                'SI.todokedeID, '+
                'TD.todokedeKubun, '+
                'SI.shoninFlag, '+
                'ISNULL(SI.sinseiDate, N'''') AS sinseiDate, '+
                'ISNULL(SI.shoninDate, N'''') AS shoninDate, '+
                'SI.hayadeFlag, '+
		        'ISNULL(TD.todokedeName,''打刻修正'') AS todokedeName '+
            'FROM MK_sinsei AS SI '+
            'INNER JOIN MK_staff ON '+
                'SI.companyID=MK_staff.companyID AND '+
                'SI.sinseiStaffID=MK_staff.staffID '+
            'LEFT OUTER JOIN '+
                '(SELECT '+
                    'staffID, '+
                    'name, '+
                    'email '+
                'FROM MK_staff AS MK_staff_1 '+
                'WHERE '+
                    'companyID=N''' + @companyID + '''' +
                ') AS kanriST ON '+
                'SI.shoninStaffID=kanriST.staffID '+
            'INNER JOIN '+
		        '(SELECT '+
                    'sinseiNo, '+
                    'MAX(taishouDate) AS endDate '+
                'FROM MK_sinsei '+
                'WHERE '+
                    'companyID=N''' + @companyID + '''' +
                'GROUP BY '+
                    'sinseiNo '+
                ') AS sinseiSub ON '+
                    'SI.sinseiNo=sinseiSub.sinseiNo '+
            'LEFT OUTER JOIN '+
			    '(SELECT '+
                    'staffID, '+
                    'name '+
                'FROM MK_staff AS MK_staff_2 '+
                'WHERE '+
                    'companyID=N''' + @companyID + '''' +
                ') AS commitST ON '+
                    'SI.commitStaffID=commitST.staffID '+
            'LEFT OUTER JOIN MK_todokede AS TD ON '+
                'SI.todokedeID=TD.todokedeID AND '+
                'SI.companyID=TD.companyID '+
            'WHERE '+
                'SI.companyID=N''' + @companyID + '''' +
                @whereSQL +
            'ORDER BY '+
			    'sinseiSub.endDate ASC, '+
                'SI.sinseiNo ASC, '+
                'SI.shoninFlag ASC, '+
                'SI.taishouDate ASC '
			--SQL実行
			EXEC (@varSQL)
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
 PRINT @varSQL
RETURN



GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201201]
--パラメーター
 @sinseiID int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：対象データの明細取得
			SELECT *
            FROM MK_sinsei
            WHERE
               (sinseiNo=@sinseiID) AND
               (companyID=@companyID)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201203]
--パラメーター
 @staffID nvarchar(20),
 @taishouDate nvarchar(10),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：カレンダーの休日区分取得
			SELECT
				holiday
			FROM 
				MK_calendar
			WHERE
				companyID=@companyID AND
				number=(
					SELECT 
						calendarID
					FROM 
						MK_staff
					WHERE 
						staffID = @staffID AND
						companyID = @companyID
				)
				AND
				calYmd=@taishouDate
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201204]
--パラメーター
 @today nvarchar(10),
 @staffID nvarchar(20),
 @syonin int,
 @reason nvarchar(max),
 @sinseiNo int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		--申請の更新
			UPDATE MK_sinsei
				SET						
					shoninDate=@today, 						
					commitStaffID=@staffID, 						
					shoninFlag=@syonin,
					kyakkaRiyu=@reason
				WHERE							
					sinseiNo=@sinseiNo AND
					companyID =@companyID
		
			--   更新したテーブルを表示(確認用）
			SELECT * FROM MK_sinsei
			 WHERE								
				companyID = @companyID AND
				sinseiNo = @sinseiNo
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201301]
--パラメーター
 @sinseiStaff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：該当スタッフの勤怠パターンから締め日を取得する
            SELECT
                MK_pattern.endDate
            FROM MK_pattern
             INNER JOIN MK_staff ON
                MK_pattern.patternNo=MK_staff.patternNo AND
                MK_pattern.companyID=MK_staff.companyID
            WHERE
                (MK_pattern.companyID=@companyID) AND
                (MK_staff.staffID=@sinseiStaff)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201302]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @sinseiStaff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：　合計部の取得
			SELECT
				DISTINCT MK_kintai.staffID,
				MK_staff.postID, MK_staff.kubun,
				SUM(CASE WHEN MK_kintai.overTime > 0 then 1 ELSE 0 END) AS outTimeDay,
				ISNULL(SUM(MK_kintai.underTime),'') AS underTime,
				ISNULL(SUM(MK_kintai.inTime),'') AS inTime,
				ISNULL(SUM(MK_kintai.outTime),'') AS outTime,
				ISNULL(SUM(MK_kintai.overTime),'') AS overTime,
				ISNULL(SUM(MK_kintai.midnight),'') AS nightTime
			 FROM MK_kintai
			 INNER JOIN MK_staff ON
				MK_kintai.staffID=MK_staff.staffID AND
				MK_kintai.companyID=MK_staff.companyID
			 WHERE
				MK_kintai.ymd>=@ymdA AND
				MK_kintai.ymd<=@ymdB AND
				MK_kintai.staffID=@sinseiStaff AND
				MK_kintai.companyID=@companyID
			 GROUP BY
				MK_kintai.staffID,
				MK_staff.postID,
				MK_staff.kubun
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201303]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @sinseiStaff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：　休日を含む出勤日数の取得
            SELECT
				count( MK_kintai.kintaiNo) AS kinmuDay
			FROM MK_kintai
			WHERE
				MK_kintai.kintaiNo=0 AND
				MK_kintai.ymd>=@ymdA AND
				MK_kintai.ymd<=@ymdB AND
				MK_kintai.staffID=@sinseiStaff AND
				MK_kintai.companyID=@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201304]
--パラメーター
 @sinseiStaff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：　対象スタッフの休日カレンダー番号を取得する
			SELECT
				calendarID
			 FROM MK_staff
			 WHERE
				companyID=@companyID AND
				staffID=@sinseiStaff
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201305]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @calID int,
 @sinseiStaff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：　休日勤務時間の取得
			SELECT
				MK_calendar.calYmd,
				ISNULL(SUM(MK_kintai.inTime),'') AS inTimeSum,
				ISNULL(SUM(MK_kintai.underTime),'') AS underTimeSum,
				ISNULL(SUM(MK_kintai.overTime),'') AS overTimeSum,
				ISNULL(SUM(MK_kintai.outTime),'')AS outTimeSum
			FROM MK_calendar
			 INNER JOIN MK_calManager ON
				MK_calendar.number=MK_calManager.number AND
				MK_calendar.companyID=MK_calManager.companyID
			 INNER JOIN MK_kintai ON
				MK_calendar.calYmd=MK_kintai.ymd AND
				MK_calendar.companyID=MK_kintai.companyID
			WHERE
				MK_calManager.companyID=@companyID AND
				MK_calendar.number=@calID AND
				MK_kintai.staffID=@sinseiStaff AND
				MK_calendar.calYmd>=@ymdA AND
				MK_calendar.calYmd<=@ymdB
			GROUP BY
				MK_calendar.calYmd
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201306]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @sinseiStaff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：　　勤務時間の明細取得
        SELECT
            ymd,
            kintaiNo,
            youbi,
            ISNULL(inOffice,'') AS inOffice,
            outOffice,
            restTime,
            ISNULL(underTime,'') AS underTime,
            ISNULL(overTime ,'') AS overTime,
            ISNULL(inTime   ,'') AS inTime,
            ISNULL(outTime  ,'') AS outTime,
            ISNULL((underTime + outTime + overTime),'') AS totalRoudou,
            ISNULL(maruInOffice, '') AS maruInOffice,
            ISNULL(maruOutOffice, '') AS maruOutOffice
        FROM MK_kintai
        WHERE
            MK_kintai.ymd       >=@ymdA AND
            MK_kintai.ymd       <=@ymdB AND
            MK_kintai.staffID   =@sinseiStaff AND
            MK_kintai.companyID =@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201307]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @calID int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング7：　　カレンダー設定の休日日付取得
        SELECT
            MK_calendar.calYmd,
            MK_calendar.holiday
        FROM MK_calendar
         INNER JOIN MK_calManager ON
            MK_calendar.number=MK_calManager.number AND
            MK_calendar.companyID=MK_calManager.companyID
        WHERE
            MK_calManager.companyID=@companyID AND
            MK_calendar.number=@calID AND
            MK_calendar.calYmd>=@ymdA AND
            MK_calendar.calYmd<=@ymdB
        GROUP BY
            MK_calendar.calYmd,
            MK_calendar.holiday
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201308]
--パラメーター
 @ymdA nvarchar(10),
 @ymdB nvarchar(10),
 @sinseiStaff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング8：　　申請データの取得
			SELECT
			   sinseiTable.sinseiNo,
			   CASE sinseiTable.sinseiKubun 
			   WHEN '0' THEN '打刻修正' 
			   WHEN '1' THEN '打刻修正' 
			   WHEN '2' THEN '打刻修正' 
			   ELSE todokedeTable.todokedeName END AS sinseiName,
			   sinseiTable.shoninFlag,
			   sinseiTable.taishouDate
			FROM MK_sinsei AS sinseiTable
			 LEFT OUTER JOIN MK_todokede AS todokedeTable ON
			   sinseiTable.todokedeID=todokedeTable.todokedeID
			WHERE
			   sinseiTable.taishouDate>=@ymdA AND
			   sinseiTable.taishouDate<=@ymdB AND
			   sinseiTable.sinseiStaffID=@sinseiStaff AND
			   sinseiTable.companyID=@companyID
			GROUP BY sinseiTable.id,
			   sinseiTable.sinseiNo,
			   sinseiTable.sinseiKubun,
			   todokedeTable.todokedeName,
			   sinseiTable.shoninFlag,
			   sinseiTable.taishouDate
			ORDER BY
			   sinseiTable.taishouDate ASC,
			   sinseiTable.id DESC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201405]
--パラメーター
 @staffID nvarchar(max),
 @staffName nvarchar(max),
 @sKana nvarchar(max),
 @sPost nvarchar(max),
 @sKubun nvarchar(max),
 @sPattern nvarchar(max),
 @sEnt nvarchar(max),
 @sRetire nvarchar(max),
 @companyID nvarchar(4),
 @today nvarchar(10)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：リスト表示内容の取得
			DECLARE @varSQL VARCHAR(max)
			DECLARE @strWhere VARCHAR(max)
			SET @strWhere = ''
			--絞込み条件の追加
			BEGIN
				IF @skana <> ''  
				   SET @strWhere += 'MK_staff.kana LIKE N''%' +@skana+ '%'' AND '
			END
			BEGIN
				IF @sPost <> ''  
				   SET @strWhere += 'MK_post.postID =N'''+ @sPost +''' AND '
			END
			BEGIN
				IF @sKubun <> ''
				   SET @strWhere += 'MK_kubun.kubun =N''' + @sKubun + ''' AND '
			END
			BEGIN
				IF @sPattern <> ''
			      SET @strWhere += 'MK_pattern.patternNo ='''+ @sPattern +''' AND '
			END
			BEGIN
				IF @sEnt <> ''
			      SET @strWhere += 'MK_staff.entDate LIKE N''%' + @sEnt + '%'' AND '
			END
			BEGIN
				IF @sRetire <> ''
				BEGIN
					IF @sRetire = '0'
						 SET @strWhere += '((MK_staff.retireDate IS NULL) OR (MK_staff.retireDate = '''') OR (MK_staff.retireDate >= N''' + @today + ''')) AND '
					ELSE IF @sRetire = '1'
						 SET @strWhere += 'MK_staff.retireDate <> N'''' AND MK_staff.retireDate < N''' + @today + ''' AND '
				END
			END

			SET @varSQL = 
						'SELECT '+
						'    MK_staff.staffID, '+
						'    MK_staff.companyID, '+
						'    MK_staff.name, '+
						'    ISNULL(MK_staff.kana, '''') AS kana, '+
						'    ISNULL(MK_staff.kubun, '''') AS kubun, '+
						'    ISNULL(MK_staff.entDate,'''') AS entDate, '+
						'    ISNULL(MK_staff.retireDate,'''') AS retireDate, '+
						'    ISNULL(MK_staff.birthday,'''') AS birthday, '+
						'    ISNULL(MK_staff.email,'''') AS email, '+
						'    ISNULL(MK_staff.url,'''') AS url, '+
						'    ISNULL(MK_staff.memo,'''')AS memo, '+
						'    ISNULL(MK_post.postName,'''') AS postName, '+
						'    ISNULL(MK_kubun.kubunName,'''') AS kubunName, '+
						'    MK_pattern.startWork, '+
						'    MK_pattern.endWork, '+
						'    MK_pattern.memo, '+
						'    MK_calManager.name AS calendar '+
						'FROM '+
						'    MK_staff '+
						'    INNER JOIN MK_calManager ON '+
						'    MK_staff.companyID=MK_calManager.companyID AND '+
						'    MK_staff.calendarID=MK_calManager.number '+
						'    LEFT OUTER JOIN MK_kubun ON '+
						'    MK_staff.kubun=MK_kubun.kubun AND '+
						'    MK_staff.companyID=MK_kubun.companyID '+
						'    LEFT OUTER JOIN MK_post ON '+
						'    MK_staff.postID=MK_post.postID AND '+
						'    MK_staff.companyID=MK_post.companyID '+
						'    LEFT OUTER JOIN MK_pattern ON '+
						'    MK_staff.patternNo=MK_pattern.patternNo AND '+
						'    MK_staff.companyID=MK_pattern.companyID '+
						'WHERE '+
						'    MK_staff.staffID LIKE N''%' + @staffID + '%'' AND '+
						'    MK_staff.name LIKE N''%' + @staffName + '%'' AND '+
						@strWhere +
						'MK_staff.companyID =''' + @companyID + ''' '+
						'ORDER BY '+
						'    MK_staff.staffID asc'

			--SQL実行
			EXEC (@varSQL)

        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
 PRINT @varSQL
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201501]
--パラメーター
 @companyID nvarchar(4),
 @post nvarchar(2),
 @kubun nvarchar(2),
 @staffID nvarchar(20),
 @staffName nvarchar(max),
 @kana nvarchar(max),
 @pattern nvarchar(2),
 @ent nvarchar(10),
 @retire nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：印刷データリストの取得
			DECLARE @varSQL VARCHAR(max)
			DECLARE @addWhere VARCHAR(max)

			SET @addWhere = ''
			BEGIN
				IF @post <> ''
			       SET @addWhere +='AND MK_post.postID = N''' + @post + ''' '
			END
			BEGIN
				IF @kubun <> ''
			       SET @addWhere +='AND MK_kubun.kubun = N''' + @kubun + ''' '
			END
			BEGIN
				IF @staffID <> ''
			       SET @addWhere +='AND MK_staff.staffID = N''' + @staffID + ''' '
			END
			BEGIN
				IF @staffName <> ''
			       SET @addWhere +='AND MK_staff.name LIKE N''%' + @staffName + '%'' '
			END
			BEGIN
				IF @kana <> ''
				   SET @addWhere +='AND MK_staff.kana LIKE N''%' + @kana + '%'' '    
			END
			BEGIN
				IF @pattern <> ''
			       SET @addWhere +='AND MK_pattern.patternNo = N''' + @pattern + ''' '
			END
			BEGIN
			    IF @ent <> ''
			       SET @addWhere +='AND MK_staff.entDate = N''' + @ent + ''' '
			END
			BEGIN
				IF @retire = '0'
				   -- 在職のみ
					SET @addWhere +='AND MK_staff.retireDate = '''' '
				ELSE IF @retire = '1'
					SET @addWhere +='AND MK_staff.retireDate > N'''+ @retire +''' '
			END
       

			SET @varSQL = 
				'SELECT '+
				'    MK_company.loginAccount, '+
				'    ISNULL(MK_staff.appTourokuID,'''')as appTourokuID , '+
				'    MK_staff.name, '+
				'    MK_staff.email, '+
				'    MK_staff.password, '+
				'    MK_post.postName, '+
				'    MK_pattern.startWork, '+
				'    MK_pattern.endWork '+
				'FROM '+
				'    MK_staff '+
				'    INNER JOIN MK_company ON '+
				'    MK_staff.companyID = MK_company.companyID '+
				'    INNER JOIN MK_post ON '+
				'    MK_staff.postID = MK_post.postID AND '+
				'    MK_staff.companyID = MK_post.companyID '+
				'    INNER JOIN MK_kubun ON '+
				'    MK_staff.kubun = MK_kubun.kubun AND '+
				'    MK_staff.companyID = MK_kubun.companyID '+
				'    INNER JOIN MK_pattern ON '+
				'    MK_staff.patternNo = MK_pattern.patternNo AND '+
				'    MK_staff.companyID = MK_pattern.companyID '+
				'    INNER JOIN MK_calManager ON '+
				'    MK_staff.companyID = MK_calManager.companyID AND '+
				'    MK_staff.calendarID = MK_calManager.number '+
				'WHERE '+
				'    MK_company.companyID = N''' + @companyID + ''' AND '+
				'    MK_staff.email<>N'''' ' +
				@addWhere
            
            --SQL実行
			EXEC (@varSQL)

        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
 PRINT @varSQL
RETURN



GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201601]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：所属部署の取得（スタッフマスタメンテナンス用）
		    SELECT
                ISNULL(MK_post.postName,'') AS postName,
                MK_post.postID
             FROM MK_post
             WHERE
                companyID=@companyID
             ORDER BY
                MK_post.postID ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201602]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：雇用形態の取得（スタッフマスタメンテナンス用）
		    SELECT
                ISNULL(MK_kubun.kubunName,'') AS kubunName,
                MK_kubun.kubun
             FROM MK_kubun
             WHERE
                companyID=@companyID
             ORDER BY
                MK_kubun.kubun ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201603]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：勤怠パターンリストの取得（スタッフマスタメンテナンス用）
            SELECT
                patternNo,
                startWork,
                endWork,
                memo,
				pattern_none_flag
            FROM MK_pattern
            WHERE
                companyID=@companyID
            ORDER BY
                MK_pattern.patternNo
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201604]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：カレンダー情報の取得
            SELECT
                number,
                name
            FROM MK_calManager
            WHERE
                companyID=@companyID
            ORDER BY
                MK_calManager.number ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201605]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：登録済みスタッフカウント数の取得
            SELECT
                COUNT(staffID) AS staffCount
            FROM MK_staff
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201606]
--パラメーター
 @shozoku nvarchar(2),
 @kubun nvarchar(2),
 @pattern nvarchar(2),
 @sID nvarchar(max),
 @staffID nvarchar(max),
 @staffName nvarchar(max),
 @staffKana nvarchar(max),
 @entDate nvarchar(10),
 @retire nvarchar(max),
 @today nvarchar(10),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：スタッフ情報の取得
			DECLARE @varSQL VARCHAR(max)
			DECLARE @addWhere nvarchar(max) = ''
			--parameterの取得で絞り込みを変更
			BEGIN
				IF @staffID <> ''
				SET @addWhere += ' AND MK_staff.staffID = N'''+ @staffID +''' '
			END
			BEGIN
				IF @sID <> ''
				SET @addWhere += ' AND MK_staff.staffID LIKE N''%' + @sID + '%'' '
			END
			BEGIN
				IF @shozoku = ''
					SET @addWhere += ' AND MK_staff.postID LIKE N''%'+ @shozoku + '%'' '
				ELSE
					SET @addWhere += ' AND MK_staff.postID = N''' + @shozoku + ''' '
			END
			BEGIN
				IF @kubun =''
					SET @addWhere += ' AND MK_Staff.kubun LIKE N''%' + @kubun + '%'' '
				ELSE
					SET @addWhere += ' AND MK_staff.kubun = N''' + @kubun + ''' '
			END
			BEGIN
				IF @pattern = ''
					SET @addWhere += ' AND MK_staff.patternNo LIKE N''%' + @pattern + '%'' '
				ELSE
					SET @addWhere += ' AND MK_staff.patternNo = N''' + @pattern + ''' '
			END
			BEGIN
				IF @staffName <> ''
					SET @addWhere += ' AND MK_staff.name LIKE N''%' + @staffName + '%'' '
			END
			BEGIN
				IF @staffKana <> ''
					SET @addWhere += ' AND MK_staff.kana LIKE N''%' + @staffKana + '%'' '
			END
			BEGIN
				IF @entDate <> ''
					SET @addWhere += ' AND MK_staff.entDate LIKE N''%' + @entDate +'%'' '
			END
      		BEGIN
				IF @retire <> ''
					BEGIN
						IF @retire = '0'
							SET @addWhere += ' AND ((MK_staff.retireDate IS NULL) OR (MK_staff.retireDate = '''') OR (MK_staff.retireDate >= N''' + @today + ''')) '
						ELSE IF @retire = '1'
 	        				SET @addWhere +=' AND (MK_staff.retireDate <> N'''')  AND MK_staff.retireDate < N''' + @today + ''' '
					END
			END
			SET @varSQL = 
						'SELECT '+
							'MK_staff.staffID, '+
							'MK_staff.name, '+
							'ISNULL(MK_staff.kana, '''') AS kana, '+
							'ISNULL(MK_staff.kubun, '''') AS kubun, '+
							'ISNULL(MK_staff.postID, '''') AS postID, '+
							'ISNULL(MK_staff.entDate,'''') AS entDate, '+
							'ISNULL(MK_staff.retireDate,'''') AS retireDate, '+
							'ISNULL(MK_staff.birthday,'''') AS birthday, '+
							'ISNULL(MK_staff.email,'''') AS email, '+
							'MK_staff.admCD, '+
							'MK_staff.calendarID, '+
							'ISNULL(MK_staff.memo,'''') AS memo, '+
							'ISNULL(MK_staff.patternNo,'''') AS patternNo, '+
							'ISNULL(MK_staff.faxRec,'''') AS faxRec, '+
							'ISNULL(MK_staff.GPS, 0) AS GPS '+
						'FROM '+
							'MK_staff '+
							'LEFT OUTER JOIN MK_kubun ON '+
							'MK_staff.kubun=MK_kubun.kubun AND '+
							'MK_staff.companyID=MK_kubun.companyID '+
							'LEFT OUTER JOIN MK_post ON '+
							'MK_staff.postID=MK_post.postID AND '+
							'MK_staff.companyID=MK_post.companyID '+
							'LEFT OUTER JOIN MK_pattern ON '+
							'MK_staff.patternNo=MK_pattern.patternNo AND '+
							'MK_staff.companyID=MK_pattern.companyID '+
						'WHERE MK_staff.companyID        =N'''+ @companyID + ''' '+
							@addWhere
           		--SQL実行
			EXEC (@varSQL)
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
	PRINT @varSQL
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[ver_2_5_201607]
--パラメーター
	@staffID nvarchar(20),
    @staffName nvarchar(21),
    @staffKana nvarchar(41),
    @post nvarchar(2),
    @kubun nvarchar(2),
    @entDate nvarchar(10),
    @retireDate nvarchar(10),
    @birthdayFlag int,
    @birthday nvarchar(10),
	@email nvarchar(max),
    @patternNo int,
    @memo nvarchar(max),
    @admCD int,
    @calendarID int,
    @companyID nvarchar(4),
    @appTourokuID nvarchar(20),
    @faxRec nvarchar(max),
    @GPS int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
			--　新規スタッフの登録
			INSERT INTO  MK_staff 
			(															
				staffID,														
				name,														
				kana,														
				postID,														
				kubun,														
				entDate,														
				retireDate,														
				birthdayFlag,														
				birthday,														
				email,														
				url,														
				password,														
				patternNo,														
				memo,														
				admCD,														
				calendarID,														
				companyID,														
				appTourokuID, 														
				faxRec,														
				GPS	
			) VALUES (															
				@staffID,
				@staffName,
				@staffKana,
				@post,														
				@kubun,														
				@entDate,
				@retireDate,
				@birthdayFlag,
				@birthday,
				@email,
				'',
				'',													
				@patternNo,
				@memo,
				@admCD,
				@calendarID,
				@companyID,
				@appTourokuID,
				@faxRec,
				@GPS
			)																											
          	--   更新したテーブルを表示(確認用）
			SELECT * FROM MK_staff
			 WHERE								
				companyID = @companyID AND
				staffID = @staffID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201608]
--パラメーター
 	@staffID nvarchar(20),
    @staffName nvarchar(21),
    @staffKana nvarchar(41),
    @post nvarchar(2),
    @kubun nvarchar(2),
    @entDate nvarchar(10),
    @retireDate nvarchar(10),
    @birthdayFlag int,
    @birthday nvarchar(10),
	@email nvarchar(max),
    @patternNo int,
    @memo nvarchar(max),
    @admCD int,
    @calendarID int,
    @companyID nvarchar(4),
    @faxRec nvarchar(max),
    @GPS int
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：スタッフ編集時の通常更新
			UPDATE MK_staff									
				SET								
				name = @staffName,
				kana =  @staffKana,
				postID = @post,
				kubun = @kubun,
				entDate = @entDate,
				retireDate =@retireDate,
				birthdayFlag =@birthdayFlag,
				birthday =@birthday,
				email = @email,
				patternNo =@patternNo,
				memo =@memo,
				admCD =@admCD,
				calendarID = @calendarID,
				faxRec = @faxRec,
				GPS = @GPS
			WHERE									
				staffID=@staffID AND
				companyID=@companyID
			
			--   更新したテーブルを表示(確認用)											
			SELECT * FROM MK_staff
			 WHERE
				companyID = @companyID AND
				staffID = @staffID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201609]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
				SELECT 
					@ucount = COUNT(*)
				FROM
			    	MK_smartPhone
				WHERE
					staffID= @staffID AND
					companyID= @companyID
			BEGIN
			  IF @ucount > 0
			   -- マッピング：スマホマスタ登録情報の削除
				DELETE					
					MK_smartPhone				
				WHERE					
					staffID= @staffID AND
					companyID= @companyID   		
			  END        
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201610]
--パラメーター
 @patternID int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング10：勤怠パターンデータの取得
		    SELECT
				MK_pattern.patternNo,
			    MK_pattern.startWork,
			    MK_pattern.endWork,
			    MK_pattern.endDate,
				MK_pattern.pattern_none_flag
			FROM MK_pattern
			WHERE
			    MK_pattern.patternNo=@patternID AND
                MK_pattern.companyID=@companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201611]
--パラメーター
 @patternID int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング11：休憩パターンデータの取得
			SELECT
			    MK_timeTable.timeTableNo,
			    MK_timeTable.startRest,
			    MK_timeTable.endRest,
			    MK_timeTable.patternNo
			FROM MK_timeTable
			 INNER JOIN MK_pattern ON
			    MK_timeTable.patternNo=MK_pattern.patternNo
			WHERE
			    MK_pattern.patternNo=@patternID AND
			    MK_timeTable.companyID=@companyID AND
			    MK_timeTable.timeTableNo<10
			GROUP BY
			    MK_timeTable.timeTableNo,
			    MK_timeTable.startRest,
			    MK_timeTable.endRest,
			    MK_timeTable.patternNo

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201612]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング12：スタッフID重複チェック
			SELECT
                staffID
            FROM MK_staff
            WHERE
             staffID=@staffID AND
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201613]
--パラメーター
 @entDay nvarchar(10),
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング13：入社日以前の勤怠データのチェック
            SELECT
                staffID
            FROM MK_kintai
            WHERE
                ymd< @entDay AND
                staffID= @staffID AND
                companyID= @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201614]
--パラメーター
 @retireday nvarchar(10),
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング14：退職日以降の勤怠データのチェック
            SELECT
                staffID
            FROM MK_kintai
            WHERE
                ymd> @retireday AND
                staffID= @staffID AND
                companyID= @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201615]
--パラメーター
 @mailAdd nvarchar(max),
 @staffID nvarchar(20)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング15：メールアドレスの重複チェック
			SELECT
				staffID
			FROM MK_staff
			WHERE
				email=@mailAdd AND
				staffID <> @staffID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201616]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング16：全権限者人数チェック
			SELECT
                COUNT(staffID) AS admCount
            FROM MK_staff
            WHERE
               (staffID<>@staffID AND admCD=0 AND retireDate='') AND
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201617]
--パラメーター
 @appID nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング17：appIDの存在チェック
			SELECT appTourokuID  
			FROM MK_staff  
			WHERE companyID = @companyID AND appTourokuID =@appID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201618]
--パラメーター
	@staffID nvarchar(20),
	@retireDate nvarchar(10),
	@companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：退職・再雇用処理
			UPDATE MK_staff					
				SET				
				retireDate = @retireDate				
			WHERE					
				staffID=@staffID AND				
				companyID=@companyID
			--   更新したテーブルを表示(確認用)
			SELECT * 
			FROM MK_staff
			WHERE 
			    staffID = @staffID AND
				companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201619]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：スタッフの削除処理
			DELETE FROM MK_Staff
			WHERE
			 staffID = @staffID AND
			 companyID = @companyID
			IF @@ROWCOUNT > 0
				BEGIN
					--'次の処理に進む'
					EXEC ver_2_5_201609 @staffID,@companyID
					EXEC ver_2_5_201621 @staffID,@companyID
					EXEC ver_2_5_201622 @staffID,@companyID
					EXEC ver_2_5_201623 @staffID,@companyID
					EXEC ver_2_5_201624 @staffID,@companyID
					EXEC ver_2_5_201625 @staffID,@companyID
					EXEC ver_2_5_201626 @staffID,@companyID
					EXEC ver_2_5_201627 @staffID,@companyID
					EXEC ver_2_5_201628 @staffID,@companyID
					EXEC ver_2_5_201629 @staffID,@companyID
				END
			ELSE
				PRINT '削除されませんでした'
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201620]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_kintai
		    WHERE
			   staffID= @staffID AND
			   companyID= @companyID
			BEGIN
			  IF @ucount > 0
			            -- マッピング：勤怠データの削除
				DELETE FROM MK_kintai
				WHERE
				 staffID = @staffID AND
				 companyID = @companyID	
			  END        
RETURN
  


GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201621]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_kojinSet
		    WHERE
			   staffID= @staffID AND
			   companyID= @companyID
			BEGIN
			  IF @ucount > 0
            -- マッピング：個人設定の削除
				DELETE FROM MK_kojinSet
				WHERE
				 staffID = @staffID AND
				 companyID = @companyID
			  END        
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201622]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_history
		    WHERE
			   staffID= @staffID AND
			   companyID= @companyID
			BEGIN
			  IF @ucount > 0
            -- マッピング：通知履歴の削除
				DELETE FROM MK_history
				WHERE
				 staffID = @staffID AND
				 companyID = @companyID
			  END        
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201623]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_historyOption
		    WHERE
			   staffID= @staffID AND
			   companyID= @companyID
			BEGIN
			  IF @ucount > 0
			-- FAX通知履歴の削除
				DELETE FROM MK_historyOption
				WHERE
				 staffID = @staffID AND
				 companyID = @companyID
			  END        
RETURN



GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201624]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_member
		    WHERE
			   memberID= @staffID AND
			   companyID= @companyID
			BEGIN
			  IF @ucount > 0
				-- マッピング：会話グループメンバーからの削除
				DELETE FROM MK_member
				WHERE
				 memberID = @staffID AND
				 companyID = @companyID
			END        
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201625]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_category
		    WHERE
			   staffID= @staffID AND
			   companyID= @companyID
			BEGIN
			  IF @ucount > 0
				-- マッピング：やる事の削除
				DELETE FROM MK_category
				WHERE
				 staffID = @staffID AND
				 companyID = @companyID
			END        
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201626]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_sinsei
		    WHERE
			   sinseiStaffID= @staffID AND
			   companyID= @companyID
			BEGIN
				IF @ucount > 0
				-- マッピング：申請したデータの削除
					DELETE FROM MK_sinsei
					WHERE
					 sinseiStaffID = @staffID AND
					 companyID = @companyID
			END
			
			SET @ucount = 0
			SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_sinsei
		    WHERE
			   shoninStaffID= @staffID AND
			   companyID= @companyID
			BEGIN
                IF @ucount > 0
				-- マッピング：承認する申請データの更新
					UPDATE MK_sinsei			
						SET		
						shoninStaffID = N'delete_staff'
					WHERE			
						shoninStaffID= @staffID AND		
						companyID= @companyID	
			END
			
			SET @ucount = 0
			SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_sinsei
		    WHERE
			   commitStaffID= @staffID AND
			   companyID= @companyID
			BEGIN
                IF @ucount > 0
				-- マッピング：承認した申請データの更新
					UPDATE MK_sinsei			
						SET		
						commitStaffID = N'delete_staff'
					WHERE			
						commitStaffID= @staffID AND		
						companyID= @companyID	
			END
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201627]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_event
		    WHERE
			   staffID= @staffID AND
			   companyID= @companyID
			BEGIN
				IF @ucount > 0
				-- マッピング：お知らせ作成者の更新
				UPDATE
					MK_event
				SET 
					staffID = N'delete_staff'
				WHERE
				 staffID = @staffID AND
				 companyID = @companyID
			END
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201628]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_chat
		    WHERE
			   memberID= @staffID AND
			   companyID= @companyID
			BEGIN
				IF @ucount > 0
				-- マッピング：会話履歴の発言者更新
					UPDATE
						MK_chat
					SET 
						memberID = N'delete_staff'
					WHERE
					 memberID = @staffID AND
					 companyID = @companyID
			END
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201629]
--パラメーター
 @staffID nvarchar(20),
 @companyID nvarchar(4)
AS
DECLARE @ucount INT
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
		       MK_todo
		    WHERE
			   staffID= @staffID AND
			   companyID= @companyID
			BEGIN
				IF @ucount > 0
					-- マッピング：やる事作成者の更新
					UPDATE
						MK_todo
					SET 
						staffID = N'delete_staff'
					WHERE
					 staffID = @staffID AND
					 companyID = @companyID
			END
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[ver_2_5_201630]
--パラメーター
 @today nvarchar(10),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		-- マッピング：退職者のスマホマスタ情報の確認と削除
		CREATE TABLE #TempSmartTable (
			  staffID NVARCHAR(20)
		)
			INSERT INTO #TempSmartTable
				SELECT 
					MK_staff.staffID
				FROM
					MK_staff INNER JOIN
					MK_smartPhone ON 
					MK_staff.companyID = MK_smartPhone.companyID AND 
					MK_staff.staffID = MK_smartPhone.staffID
				WHERE
				   (MK_staff.companyID = @companyID) AND 
				   (MK_staff.retireDate <> N'') AND 
				   (MK_staff.retireDate < @today)

			---- 格納域
			--declare @tid INT
			declare @retireStaffID NVARCHAR(20)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #TempSmartTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
               @retireStaffID
			-- カーソルが読み取れなくなるまで
			while (@@fetch_status = 0) begin															
                --		◇スマホ所持者が存在する時																			
                --		・一時テーブルのデータの数だけ以下の処理を繰り返す。																												
                -- 退職者のスマホマスタ情報の削除
                EXEC ver_2_5_201609 @retireStaffID,@companyID
				-- カーソル移動
			    fetch next from temp_cursor into @retireStaffID
			end
			-- カーソルを閉じる
			close temp_cursor
			-- カーソルを解放
			deallocate temp_cursor
			-- 必要なくなった一時テーブルを削除
			drop table #TempSmartTable	
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201705]
--パラメーター
 @companyID nvarchar(4)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：カレンダー情報の取得
			SELECT 
				number
			FROM 
				MK_calManager
			WHERE 
				companyID = @companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201801]
--パラメーター
 @companyID nvarchar(4)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：スタッフ情報出力
			SELECT * 
			FROM 
				MK_staff 
			WHERE 
				companyID = @companyID 
			ORDER BY 
				staffID ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201901]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：所属最新番号の取得
			SELECT ISNULL(MAX(CONVERT(int, postID))+1,1) AS postID
			FROM MK_post
			WHERE companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201902]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：区分最新番号の取得
			SELECT ISNULL(MAX(CONVERT(int, kubun))+1,1) AS kubun
			FROM MK_kubun
			WHERE companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201903]
--パラメーター
 @postID nvarchar(2),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：所属使用存在チェック
			SELECT
                count(postID)as postCount
            FROM
                MK_staff
            WHERE
                postID = @postID AND
                companyID = @companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201904]
--パラメーター
 @kubunID nvarchar(2),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：雇用形態使用存在チェック
			SELECT
				count(kubun)as kubunCount
            FROM
                MK_staff
            WHERE
                kubun = @kubunID AND
                companyID =@companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201905]
--パラメーター
 @postID nvarchar(2),
 @postName nvarchar(255),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
		DECLARE @ucount INT
		-- マッピング：所属の存在チェック
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
			   MK_post
			WHERE 
				postID = @postID AND
				companyID = @companyID

        BEGIN
			IF @ucount > 0
            --所属の更新
				UPDATE 
					MK_post
				SET 
					postName = @postName
				WHERE 
					postID = @postID AND
					companyID = @companyID
			ELSE
				--所属の新規登録
				INSERT INTO
					MK_post(
					 companyID,
					 postID,
					 postName
					 )VALUES(
					 @companyID,
					 @postID,
					 @postName
					 )
		END
		-- 更新したデータ（確認用）
		SELECT * 
		FROM MK_post
		WHERE
			postID = @postID AND
			companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201906]
--パラメーター
 @kubunID nvarchar(2),
 @kubunName nvarchar(255),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
		DECLARE @ucount INT
		-- マッピング：区分の存在チェック
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
			   MK_kubun
			WHERE 
				kubun = @kubunID AND
				companyID = @companyID

        BEGIN
			IF @ucount > 0
            --区分の更新
				UPDATE 
					MK_kubun
				SET 
					kubunName = @kubunName
				WHERE 
					kubun = @kubunID AND
					companyID = @companyID
			ELSE
				--区分の新規登録
				INSERT INTO
					MK_kubun(
					 companyID,
					 kubun,
					 kubunName
					 )VALUES(
					 @companyID,
					 @kubunID,
					 @kubunName
					 )
		END
		-- 更新したデータ（確認用）
		SELECT * 
		FROM MK_kubun
		WHERE
			kubun = @kubunID AND
			companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201907]
--パラメーター
 @postID nvarchar(max),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
	
	DECLARE @delNo nvarchar(2)
	DECLARE @whereSql nvarchar(max)
	
	SET @whereSql = 'WHERE companyID=N'''+@companyID+''' AND ('

	--削除対象IDをスプリットしてテーブルで取得する。
	CREATE TABLE #delIdTable(
				postID NVARCHAR(2)
			)
	BEGIN
	INSERT INTO #delIdTable	
		SELECT * FROM dbo.ufnSplitString_WHILE(@postID)
		declare @tid nvarchar(2)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #delIdTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @tid
				while (@@fetch_status = 0) begin
					SET @whereSql += ' postID = N'''+@tid+''' OR '
						-- カーソル移動
			    fetch next from temp_cursor into @tid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #delIdTable

				DECLARE @strLen int
				SET @strLen = LEN(@whereSql)
				SET @whereSql = SUBSTRING(@whereSql,0,@strLen-2)
				SET @whereSql +=')'
	END
	--削除対象データの一時テーブルを作成。
	CREATE TABLE #dataTable(
				postID NVARCHAR(2)
			)
	BEGIN
	DECLARE @varSQL VARCHAR(max)
	SET @varSQL = 'SELECT postID FROM MK_post '+@whereSql
	INSERT INTO #dataTable
	  EXEC (@varSQL)
	declare @pid nvarchar(2)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #dataTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @pid
				while (@@fetch_status = 0) begin
				 -- マッピング：所属部署の削除
				DELETE 
				FROM MK_post
				WHERE 
					postID = @pid AND
					companyID = @companyID
						-- カーソル移動
			    fetch next from temp_cursor into @pid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor

				-- 必要なくなった一時テーブルを削除
				drop table #dataTable
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201908]
--パラメーター
 @kubun nvarchar(max),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
	
	DECLARE @delNo nvarchar(2)
	DECLARE @whereSql nvarchar(max)
	
	SET @whereSql = 'WHERE companyID=N'''+@companyID+''' AND ('

	--削除対象IDをスプリットしてテーブルで取得する。
	CREATE TABLE #delIdTable(
				postID NVARCHAR(2)
			)
	BEGIN
	INSERT INTO #delIdTable	
		SELECT * FROM dbo.ufnSplitString_WHILE(@kubun)
		declare @tid nvarchar(2)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #delIdTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @tid
				while (@@fetch_status = 0) begin
					SET @whereSql += ' kubun = N'''+@tid+''' OR '
						-- カーソル移動
			    fetch next from temp_cursor into @tid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #delIdTable

				DECLARE @strLen int
				SET @strLen = LEN(@whereSql)
				SET @whereSql = SUBSTRING(@whereSql,0,@strLen-2)
				SET @whereSql +=')'
	END
	--削除対象データの一時テーブルを作成。
	CREATE TABLE #dataTable(
				kubun NVARCHAR(2)
			)
	BEGIN
	DECLARE @varSQL VARCHAR(max)
	SET @varSQL = 'SELECT kubun FROM MK_kubun '+@whereSql
	INSERT INTO #dataTable
	  EXEC (@varSQL)
	declare @pid nvarchar(2)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #dataTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @pid
				while (@@fetch_status = 0) begin
				 -- マッピング：雇用形態の削除
				DELETE 
				FROM MK_kubun
				WHERE 
					kubun = @pid AND
					companyID = @companyID
						-- カーソル移動
			    fetch next from temp_cursor into @pid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor

				-- 必要なくなった一時テーブルを削除
				drop table #dataTable
	END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

----パラメーター
-- @kubun nvarchar(2),
-- @companyID nvarchar(4)
--AS
--BEGIN TRY
--    BEGIN TRANSACTION        --トランザクションの開始
--	DECLARE @ucount INT
--		    SELECT 
--			   @ucount = COUNT(*)
--		    FROM
--				MK_kubun
--			WHERE
--			    kubun = @kubun AND
--				companyID = @companyID
--		IF @ucount > 0
--        BEGIN
--            -- マッピング：所属部署の削除
--			DELETE 
--			FROM MK_kubun
--			WHERE 
--				kubun = @kubun AND
--				companyID = @companyID
--        END
--    COMMIT TRANSACTION       --トランザクションを確定
--END TRY

----例外処理
--BEGIN CATCH
--    ROLLBACK TRANSACTION     --トランザクションを取り消し
--    PRINT ERROR_MESSAGE()    --エラー内容を戻す
--    PRINT 'ROLLBACK TRANSACTION'
--END CATCH

--RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201909]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 7、新規打刻場所名称Noの取得
			SELECT 
				ISNULL(MAX(PointNo)+1,1) AS pointNo
			FROM 
				MK_dakokuPoint
			WHERE companyID = @companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201910]
--パラメーター
 @pointID nvarchar(max),
 @pointName nvarchar(255),
 @companyID nvarchar(4),
 @staffID NVARCHAR(20)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
		DECLARE @ucount INT
		DECLARE @pointNo INT = CONVERT(INT,@pointID)
		-- マッピング：打刻場所名称の存在チェック
		    SELECT 
			   @ucount = COUNT(*)
		    FROM
			   MK_dakokuPoint
			WHERE 
				pointNo = @pointNo AND
				companyID = @companyID

        BEGIN
			IF @ucount > 0
            --打刻場所名称の更新
				UPDATE 
					MK_dakokuPoint
				SET 
					pointName = @pointName,
					updateDate = GETDATE(),
					updateStaff = @staffID
				WHERE 
					pointNo = @pointNo AND
					companyID = @companyID
			ELSE
				--打刻場所名称の新規登録
				INSERT INTO
					MK_dakokuPoint(
					 companyID,
					 pointNo,
					 pointName,
					 delFlag,
					 registDate,
					 registStaff
					 )VALUES(
					 @companyID,
					 @pointNo,
					 @pointName,
					 0,
					 GETDATE(),
					 @staffID
					 )
		END
		-- 更新したデータ（確認用）
		SELECT * 
		FROM MK_dakokuPoint
		WHERE
			pointNo = @pointNo AND
			companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201911]
--パラメーター
 @point nvarchar(max),
 @staff nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
	
	DECLARE @delNo int
	DECLARE @whereSql nvarchar(max)
	
	SET @whereSql = 'WHERE companyID=N'''+@companyID+''' AND ('

	--削除対象IDをスプリットしてテーブルで取得する。
	CREATE TABLE #delIdTable(
				pointID nvarchar(max)
			)
	BEGIN
	INSERT INTO #delIdTable	
		SELECT * FROM dbo.ufnSplitString_WHILE(@point)
		declare @tid nvarchar(max)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #delIdTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @tid
				while (@@fetch_status = 0) begin
					SET @whereSql += ' pointNo = '''+@tid+''' OR '
						-- カーソル移動
			    fetch next from temp_cursor into @tid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #delIdTable

				DECLARE @strLen int
				SET @strLen = LEN(@whereSql)
				SET @whereSql = SUBSTRING(@whereSql,0,@strLen-2)
				SET @whereSql +=')'
	END
	--削除対象データの一時テーブルを作成。
	CREATE TABLE #dataTable(
				point int
			)
	BEGIN
	DECLARE @varSQL VARCHAR(max)
	SET @varSQL = 'SELECT pointNo FROM MK_dakokuPoint '+@whereSql
	INSERT INTO #dataTable
	  EXEC (@varSQL)
	declare @pid int
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #dataTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @pid
				while (@@fetch_status = 0) begin
				 -- マッピング：打刻場所名称の削除フラグ挿入
				 UPDATE MK_dakokuPoint		
					SET	
					delFlag = '1',	
					updateDate = GETDATE(),
					updateStaff = @staff
					WHERE		
						companyID=@companyID AND	
						pointNo = @pid
				
						-- カーソル移動
			    fetch next from temp_cursor into @pid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor

				-- 必要なくなった一時テーブルを削除
				drop table #dataTable
	END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_201912]
--パラメーター
 @pointNo nvarchar(max),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：打刻場所名称の使用存在チェック
			SELECT SUM(tb1.pointCount) AS pointCount							
			FROM							
			((SELECT							
				COUNT(inPointNo) AS pointCount						
			FROM							
				MK_kintai						
			WHERE							
				companyID =@companyID AND outPointNo = @pointNo
			UNION							
			 SELECT							
				COUNT(outPointNo) AS pointCount						
			FROM							
				MK_kintai						
			WHERE							
				companyID =@companyID AND outPointNo = @pointNo))AS tb1						
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202001]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：勤怠パターンデータの取得
            SELECT
                (CASE subTable.patternNo WHEN '0' THEN '0' ELSE '1' END) AS oder, 
                SUM(subTable.restTime) AS restTime, 
				subTable.patternNo, 
				MK_pattern_1.startWork, 
				MK_pattern_1.endWork, 
                MK_pattern_1.startMarume, 
				MK_pattern_1.endMarume, 
				MK_pattern_1.endDate, 
				MK_pattern_1.memo,
				MK_pattern_1.pattern_none_flag
             FROM 
				(SELECT
					 MK_timeTable.patternNo, 
					 MK_timeTable.timeTableNo, 
					 MK_timeTable.startRest, 
                     MK_timeTable.endRest, 
					 SUM(MK_timeTable.endRest - MK_timeTable.startRest) AS restTime 
                 FROM 
					 MK_timeTable INNER JOIN 
					 MK_pattern ON 
					 MK_timeTable.patternNo = MK_pattern.patternNo AND 
                     MK_timeTable.companyID = MK_pattern.companyID 
                 WHERE 
				     MK_pattern.companyID = @companyID
                 GROUP BY 
				     MK_timeTable.patternNo, 
					 MK_timeTable.timeTableNo, 
					 MK_timeTable.startRest, 
                     MK_timeTable.endRest) 
			    AS subTable INNER JOIN 
                   MK_pattern AS MK_pattern_1 ON 
				   subTable.patternNo = MK_pattern_1.patternNo 
             WHERE 
			     MK_pattern_1.companyID = @companyID
             GROUP BY 
			     subTable.patternNo, 
				 MK_pattern_1.startWork, 
				 MK_pattern_1.endWork, 
				 MK_pattern_1.startMarume, 
                 MK_pattern_1.endMarume, 
				 MK_pattern_1.endDate, 
				 MK_pattern_1.memo,
				 MK_pattern_1.pattern_none_flag
             ORDER BY
			     patternNo ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202002]
--パラメーター
 @patern nvarchar(2),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：削除対象のパターンNoがスタッフマスタで使用されていないかの存在チェック 
			SELECT 
				COUNT(patternNo)AS patternCount 
			FROM 
                MK_staff 
            WHERE 
                patternNo =@patern AND 
                companyID =@companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202003]
--パラメーター
 @pattern nvarchar(max),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
	
	DECLARE @whereSql nvarchar(max)
	
	SET @whereSql = 'WHERE companyID=N'''+@companyID+''' AND ('

	--削除対象IDをスプリットしてテーブルで取得する。
	CREATE TABLE #delIdTable(
				patternNo nvarchar(max)
			)
	BEGIN
	INSERT INTO #delIdTable	
		SELECT * FROM dbo.ufnSplitString_WHILE(@pattern)
		declare @tid nvarchar(max)
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #delIdTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @tid
				while (@@fetch_status = 0) begin
					SET @whereSql += ' patternNo = '''+@tid+''' OR '
						-- カーソル移動
			    fetch next from temp_cursor into @tid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #delIdTable

				DECLARE @strLen int
				SET @strLen = LEN(@whereSql)
				SET @whereSql = SUBSTRING(@whereSql,0,@strLen-2)
				SET @whereSql +=')'
	END
	--削除対象データの一時テーブルを作成。
	CREATE TABLE #dataTable(
				patternNo INT
			)
	BEGIN
	DECLARE @varSQL VARCHAR(max)
	SET @varSQL = 'SELECT patternNo FROM MK_pattern '+@whereSql
	INSERT INTO #dataTable
	  EXEC (@varSQL)
	declare @pid INT
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #dataTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @pid
				while (@@fetch_status = 0) begin
				 -- マッピング：勤怠パターンの削除
				DELETE 
				FROM MK_pattern
				WHERE 
					patternNo = @pid AND
					companyID = @companyID

				 -- マッピング：タイムテーブルの削除
				 DELETE
				 FROM MK_timeTable
				 WHERE
				  	patternNo = @pid AND
					companyID = @companyID
						
						-- カーソル移動
			    fetch next from temp_cursor into @pid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #dataTable
	END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202004]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：勤怠パターンのゴミデータのチェック
			-- 一時テーブルの作成
			CREATE TABLE #TemporaryTable (
			  tid INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
			  patternNo INT,
			  tableNo INT
			)
			BEGIN
			INSERT INTO #TemporaryTable
				SELECT patternTable.patternNo,timeTable.patternNo AS tableNo
				FROM
				(SELECT                       patternNo
				FROM                         dbo.MK_pattern
				WHERE                       (companyID = @companyID)) AS patternTable LEFT OUTER JOIN
				(SELECT DISTINCT patternNo
				FROM                         dbo.MK_timeTable
				WHERE                       (companyID = @companyID)) AS timeTable ON patternTable.patternNo = timeTable.patternNo
			declare @pid INT
			declare @patternNo INT
			declare @tableNo INT
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #TemporaryTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @pid,@patternNo,@tableNo
				while (@@fetch_status = 0) begin
				 -- マッピング：勤怠パターンの削除
				BEGIN
					IF @tableNo IS NULL
						DELETE 
						FROM MK_pattern
						WHERE 
							patternNo = @patternNo AND
							companyID = @companyID					
				END
				-- カーソル移動
			    fetch next from temp_cursor into @pid,@patternNo,@tableNo
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #TemporaryTable
			END
			--マッピング：タイムテーブルのゴミデータのチェック
			-- 一時テーブルの作成
			CREATE TABLE #timeTemporaryTable (
			  tid INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
			  patternNo INT,
			  tableNo INT
			)
			BEGIN
			INSERT INTO #timeTemporaryTable
				SELECT patternTable.patternNo,timeTable.patternNo AS tableNo
				FROM
				(SELECT                       patternNo
				FROM                         dbo.MK_pattern
				WHERE                       (companyID = @companyID)) AS patternTable RIGHT OUTER JOIN
				(SELECT DISTINCT patternNo
				FROM                         dbo.MK_timeTable
				WHERE                       (companyID = @companyID)) AS timeTable ON patternTable.patternNo = timeTable.patternNo
			
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #timeTemporaryTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @pid,@patternNo,@tableNo
				while (@@fetch_status = 0) begin
				 -- マッピング：タイムテーブルの削除
				BEGIN
					IF @patternNo IS NULL
						DELETE 
						FROM MK_timeTable
						WHERE 
							patternNo = @tableNo AND
							companyID = @companyID					
				END
				-- カーソル移動
			    fetch next from temp_cursor into @pid,@patternNo,@tableNo
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #timeTemporaryTable
			END
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202101]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：基本パターンのデータを取得
            SELECT
				startWork,
				endWork,
				startMarume,
				endMarume,
				endDate 
            FROM
			    MK_pattern 
			WHERE 
			    patternNo ='0' AND 
				companyID = @companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202102]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：新規パターンNoの取得
           SELECT 
				MAX(patternNo) + 1 AS newNumber
           FROM  
				MK_pattern
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202103]
--パラメーター
 @patternNo nvarchar(2),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：初期データの取得
              SELECT
                  SUM(subTable.restTime) AS restTime,
                  MK_pattern_1.startWork,
                  MK_pattern_1.endWork,
                  MK_pattern_1.startMarume,
                  MK_pattern_1.endMarume,
                  MK_pattern_1.endDate,
                  MK_pattern_1.memo,
				  MK_pattern_1.pattern_none_flag,
				  ISNULL(MK_pattern_1.pattern_none_1,0) AS none_1,
				  ISNULL(MK_pattern_1.pattern_none_2,0.75) AS none_2,
				  ISNULL(MK_pattern_1.pattern_none_3,1.0) AS none_3
              FROM
                 (SELECT 
					  MK_timeTable.patternNo,
                      MK_timeTable.timeTableNo,
					  MK_timeTable.startRest,
                      MK_timeTable.endRest, 
					  SUM(MK_timeTable.endRest - MK_timeTable.startRest) AS restTime
                  FROM 
					  MK_timeTable INNER JOIN 
					  MK_pattern ON 
					  MK_timeTable.patternNo = MK_pattern.patternNo AND
                      MK_timeTable.companyID = MK_pattern.companyID
                  WHERE 
					  MK_pattern.companyID= @companyID
                  GROUP BY 
				      MK_timeTable.patternNo, 
					  MK_timeTable.timeTableNo, 
					  MK_timeTable.startRest, 
					  MK_timeTable.endRest
				 ) AS subTable INNER JOIN
                   MK_pattern AS MK_pattern_1 ON
                   subTable.patternNo = MK_pattern_1.patternNo
               WHERE
                   MK_pattern_1.patternNo= @patternNo AND
                   MK_pattern_1.companyID= @companyID
               GROUP BY
                   subTable.patternNo,
                   MK_pattern_1.startWork,
                   MK_pattern_1.endWork,
                   MK_pattern_1.startMarume,
                   MK_pattern_1.endMarume,
                   MK_pattern_1.endDate,
                   MK_pattern_1.memo,
				   MK_pattern_1.pattern_none_flag,
				   MK_pattern_1.pattern_none_1,
				   MK_pattern_1.pattern_none_2,
				   MK_pattern_1.pattern_none_3

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202104]
--パラメーター
 @patternNo nvarchar(2),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：休憩時間のセット
			SELECT
				patternNo, 
				timeTableNo, 
				startRest, 
				endRest
            FROM  
				MK_timeTable
            WHERE 
				companyID = @companyID AND 
				patternNo = @patternNo
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202105]
--パラメーター
 @patternNo nvarchar(2),
 @patternName nvarchar(max),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：選択パターンNo以外の登録済みデータに対する同一名のチェック
		    SELECT 
				memo 
			FROM 
				MK_pattern
            WHERE 
				patternNo <> @patternNo AND 
				memo = @patternName AND 
				companyID= @companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202106]
--パラメーター
 @patternNo nvarchar(2),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：タイムテーブル再取得
			SELECT 
				timeTableNo,
				ROW_NUMBER() OVER(ORDER BY timeTableNo ASC)-1 num
			FROM
				MK_timeTable
			WHERE
				patternNo =@patternNo AND 
				companyID =@companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202107]
--パラメーター
 @patternFlag INT,
 @hanteiFlag INT,
 @patternNo INT,
 @companyID nvarchar(4),
 @ptName nvarchar(255),
 @sime INT,
 @sMaru float,
 @eMaru float,
 @sWork float,
 @eWork float,
 @noneRest_1 float,
 @noneRest_2 float,
 @noneRest_3 float

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		 BEGIN
			IF @noneRest_2 = 0
    		SET @noneRest_2 = 0.75
		 END
		 BEGIN
			IF @noneRest_3 = 0
			SET @noneRest_3 = 1
		 END
            -- マッピング：勤怠パターンの登録・更新
			IF @hanteiFlag = 1 
			   BEGIN
				  IF @patternFlag = 1
					--編集時
						UPDATE MK_pattern
						SET 
							memo = @ptName,
							endDate = @sime,
							startMarume = @sMaru,
							endMarume = @eMaru,
							startWork = @sWork,
							endWork = @eWork,
							pattern_none_flag = @patternFlag
						WHERE 
							companyID = @companyID AND
							patternNo = @patternNo
				   ELSE
					   UPDATE MK_pattern
						SET 
							memo = @ptName,
							endDate = @sime,
							startMarume = @sMaru,
							endMarume = @eMaru,
							startWork = @sWork,
							endWork = @eWork,
							pattern_none_flag = @patternFlag,
							pattern_none_1 = @noneRest_1,
							pattern_none_2 = @noneRest_2,
							pattern_none_3 = @noneRest_3
						WHERE 
							companyID = @companyID AND
							patternNo = @patternNo
				END
			ELSE
				--新規登録時
				INSERT INTO MK_pattern(
					patternNo,
					startWork,
					endWork,
					startMarume,
					endMarume,
					endDate,
					companyID,
					memo,
					pattern_none_flag,
					pattern_none_1,
					pattern_none_2,
					pattern_none_3
				)VALUES(
					@patternNo,
					@sWork,
					@eWork,
					@sMaru,
					@eMaru,
					@sime,
					@companyID,
					@ptName,
					@patternFlag,
					@noneRest_1,
					@noneRest_2,
					@noneRest_3
				)

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202108]
--パラメーター
 @hanteiFlag INT,
 @patternNo INT,
 @companyID nvarchar(4),
 @tableID INT,
 @sRest nvarchar(max),
 @eRest nvarchar(max)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
	declare @floatSrest float
	declare @floatErest float
	SET @floatSrest = CONVERT(float,@sRest)
	SET @floatErest = CONVERT(float,@eRest)
        BEGIN
            -- マッピング：休憩パターンの登録・更新
			IF @hanteiFlag = 1
				--編集時
				UPDATE MK_timeTable
				SET startRest = @floatSrest,
					endRest = @floatErest
				WHERE 
					companyID = @companyID AND
					patternNo = @patternNo AND
					timeTableNo = @tableID
			ELSE
				--新規登録時
				INSERT INTO MK_timeTable(
					companyID,
					patternNo,
					timeTableNo,
					startRest,
					endRest
				)VALUES(
					@companyID,
					@patternNo,
					@tableID,
					@sRest,
					@eRest
				)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202109]
--パラメーター
 @tableNo nvarchar(max),
 @patternNo INT,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始

	--削除対象IDをスプリットしてテーブルで取得する。
	CREATE TABLE #delIdTable(
				tableID INT
			)
	BEGIN
	INSERT INTO #delIdTable	
		SELECT * FROM dbo.ufnSplitString_WHILE(@tableNo)
		declare @tid int
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #delIdTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @tid
				while (@@fetch_status = 0) begin
					--　タイムテーブルの削除
					DELETE MK_timeTable 
					WHERE companyID = @companyID AND
						  patternNo = @patternNo AND
						  timeTableNo = @tid
						-- カーソル移動
			    fetch next from temp_cursor into @tid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #delIdTable
	END
	BEGIN
		--削除後のタイムテーブルデータの取得
		CREATE TABLE #afterTimeTable(
			tableNo INT,
			rowNo INT
		)
		INSERT INTO #afterTimeTable
		EXEC ver_2_5_202106 @patternNo,@companyID
		DECLARE @pid int
		DECLARE @rNo int
		--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #afterTimeTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @pid,@rNo
				while (@@fetch_status = 0) begin
					--　タイムテーブルの更新
					UPDATE MK_timeTable
					SET timeTableNo = @rNo
					WHERE companyID = @companyID AND
						  patternNo = @patternNo AND
						  timeTableNo = @pid
						-- カーソル移動
			    fetch next from temp_cursor into @pid,@rNo
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #afterTimeTable
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202201]
--パラメーター
 @companyID nvarchar(4)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：会社情報の取得
			SELECT 
				name, 
				presTime, 
				presFlag, 
				yakinKugiriTime
			FROM 
				MK_company 
			WHERE 
				companyID =@companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202202]
--パラメーター
 @kisokuTotal float,
 @setFlag INT,
 @yakinKugiriTime float,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：就業規則の更新
			UPDATE MK_company
			SET presTime = @kisokuTotal,
				presFlag = @setFlag,
				yakinKugiriTime = @yakinKugiriTime
			WHERE companyID = @companyID

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202301]
--パラメーター
 @calendarDate nvarchar(10),
 @calendarNo int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング1：カレンダー情報の有無
			SELECT
				calYmd,
				ISNULL(holiday,'') AS holiday
			FROM 
				MK_calendar
			WHERE
				MK_calendar.calYmd LIKE '%'+  @calendarDate +'%' AND 
				MK_calendar.number= @calendarNo AND
				MK_calendar.companyID=@companyID
			ORDER BY
				calYmd ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202302]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング2：カレンダー取得
			SELECT 
				number, 
				name 
			FROM 
				MK_calManager 
			WHERE 
				companyID =@companyID
			ORDER BY 
				MK_calManager.number ASC
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202303]
--パラメーター
 @number int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング3：使用中カレンダー判定
			SELECT 
				calendarID
			FROM 
				MK_staff
			WHERE 
				calendarID =@number AND 
				companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202304]
--パラメーター
 @number int,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング4：削除後のカレンダー情報の取得
			SELECT *
			FROM   
				MK_calManager
			WHERE  
				companyID=@companyID AND 
				number = @number

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202305]
--パラメーター
 @number int,
 @calendarName nvarchar(max),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング5：カレンダー名存在チェック
			SELECT *
			FROM 
				MK_calManager
			WHERE 
				companyID =@companyID AND 
				number <> @number AND 
				name = @calendarName

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202306]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング6：新規カレンダー番号の取得
			SELECT
				MAX(number) AS number
			FROM 
				MK_calManager
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202307]
--パラメーター
 @number int,
 @calYmd nvarchar(10),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング7：更新対象カレンダーの既存データ取得
			SELECT
				calYmd,
				ISNULL(holiday,'') AS holiday
			FROM MK_calendar
			 INNER JOIN MK_calManager ON
				MK_calendar.number=MK_calManager.number AND
				MK_calendar.companyID=MK_calManager.companyID
			WHERE
				MK_calendar.number=@number AND
				MK_calendar.calYmd LIKE '%'+  @calYmd +'%' AND 
				MK_calManager.companyID=@companyID
			ORDER BY
				calYmd ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202308]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング8：カレンダー日付設定のゴミデータチェック
        SELECT
            MK_calendar.number
        FROM
            MK_calendar LEFT OUTER JOIN
            MK_calManager ON MK_calendar.number = MK_calManager.number AND
            MK_calendar.companyID = MK_calManager.companyID
        WHERE
            MK_calendar.companyID = @companyID AND 
			MK_calManager.name IS NULL
        GROUP BY
            MK_calendar.number

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202309]
--パラメーター
 @entryFlag INT,
 @calNumber INT,
 @calName nvarchar(20),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：カレンダー（ヘッダー）の登録・更新
			IF @entryFlag = 0
				--新規登録
				INSERT INTO MK_calManager(
				 number,
				 name,
				 companyID
				)VALUES(
				 @calNumber,
				 @calName,
				 @companyID
				)
			ELSE
				--更新
				UPDATE MK_calManager
				SET name = @calName
				WHERE
				    number = @calNumber AND
					companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202310]
--パラメーター
 @calNumber INT,
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- マッピング：カレンダー（ヘッダー）情報の削除
			DELETE FROM MK_calManager
			WHERE 
				number = @calNumber AND
				companyID = @companyID
        END
		BEGIN
			--カレンダー明細の削除
			DELETE FROM MK_calendar 
			WHERE companyID = @companyID AND
				  number = @calNumber
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202311]
--パラメーター
 @strNumber nvarchar(max),
 @strYM nvarchar(7),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
 	--削除対象IDをスプリットしてテーブルで取得する。
	CREATE TABLE #delIdTable(
				tableID INT
			)
	BEGIN
	INSERT INTO #delIdTable	
		SELECT * FROM dbo.ufnSplitString_WHILE(@strNumber)
		declare @tid int
			--カーソル宣言
			declare temp_cursor cursor fast_forward for
			SELECT * FROM #delIdTable
			-- カーソルオープン
			open temp_cursor
			-- カーソル移動
			fetch next from temp_cursor into
                @tid
				while (@@fetch_status = 0) begin
               -- マッピング：カレンダー休日設定（明細）の削除
					DELETE MK_calendar 
					WHERE companyID = @companyID AND
						  number = @tid AND
						  calYmd LIKE @strYm+'%'
						-- カーソル移動
			    fetch next from temp_cursor into @tid
				end              
				-- カーソルを閉じる
				close temp_cursor
				-- カーソルを解放
				deallocate temp_cursor
				-- 必要なくなった一時テーブルを削除
				drop table #delIdTable
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202401]
--パラメーター
 @staffName nvarchar(max),
 @sPost nvarchar(2),
 @sKubun nvarchar(2),
 @sPattern nvarchar(max),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		    DECLARE @varSQL VARCHAR(max)
			DECLARE @addWhere nvarchar(max) = ''

				-- マッピング1：登録済み打刻カード情報の取得
			IF @sPost <> ''
				SET @addWhere += 'MK_staff.postID =N''' + @sPost + ''' AND '

			IF @sKubun <> ''
				SET @addWhere += 'MK_staff.kubun =N''' + @sKubun + ''' AND '

			IF @sPattern <> ''
				SET @addWhere += 'MK_staff.patternNo =''' + @sPattern + ''' AND '
			SET  @varSQL =
			'SELECT'+
			'    CASE WHEN MK_staff.retireDate = '''' THEN MK_smartPhone.name WHEN MK_staff.retireDate IS NULL '+
			'    THEN MK_smartPhone.name ELSE ''退職'' END AS tanmatsuName, '+
			'    MK_smartPhone.staffID, '+
			'    MK_staff.name, '+
			'    MK_smartPhone.idm, '+
			'    MK_smartPhone.entryDate '+
			'FROM '+
			'    MK_smartPhone LEFT OUTER JOIN '+
			'    MK_staff ON MK_staff.companyID = MK_smartPhone.companyID '+
			'    AND MK_staff.staffID = MK_smartPhone.staffID '+
			'WHERE '+
			'    MK_staff.name LIKE N''%' + @staffName + '%'' AND '+
			@addWhere+
			'    MK_smartPhone.companyID =N'''+@companyID+''' AND '+
			'    MK_smartPhone.name = N''card'' '+
			'ORDER BY '+
			'    MK_staff.retireDate DESC,'+
			'    MK_smartPhone.staffID asc'
				--SQL実行
			EXEC (@varSQL)
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
   PRINT @varSQL
RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_202402]
--パラメーター
 @strDelStaff nvarchar(20),
 @strIdm nvarchar(16),
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
	--対象データの削除
		BEGIN
		    DELETE FROM MK_smartPhone
			WHERE 
				companyID = @companyID AND
				staffID = @strDelStaff AND
				idm = @strIdm
	END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

	--		--削除対象IDをスプリットしてテーブルで取得する。
	--CREATE TABLE #delstaffTable(
	--			indexNo INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	--			tableID nvarchar(20)
	--		)
	--CREATE TABLE #delIdmTable(
	--			indexNo INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
	--			imd nvarchar(16)
	--		)
	--DECLARE @strDelData nvarchar(max)

	--BEGIN
	--INSERT INTO #delstaffTable	
	--	SELECT * FROM dbo.ufnSplitString_WHILE(@strDelStaff)
	--INSERT INTO #delIdmTable
	--	SELECT * FROM dbo.ufnSplitString_WHILE(@strIdm)

	--	declare @tid int
	--	declare @staff nvarchar(20)
	--		declare temp_cursor cursor fast_forward for
	--		SELECT * FROM #delstaffTable
	--		-- カーソルオープン
	--		open temp_cursor
	--		-- カーソル移動
	--		fetch next from temp_cursor into
	--		@tid,@staff               
	--			while (@@fetch_status = 0) begin	
	--			declare @pid int
	--			declare @idm nvarchar(16)
	--				declare idm_cursor cursor fast_forward for
	--				SELECT * FROM #delIdmTable
	--				-- カーソルオープン
	--					open idm_cursor				
	--					-- カーソル移動
	--					fetch next from idm_cursor into @pid,@idm
	--					while(@@FETCH_STATUS = 0)begin
	--					  if @pid=@tid
	--					    BEGIN
	--						--対象データの削除
	--						DELETE FROM MK_smartPhone
	--						WHERE 
	--							companyID = @companyID AND
	--							staffID = @staff AND
	--							idm = @idm

	--						--デバッグ用
	--							SET @strDelData = '削除対象はスタッフ番号'+@staff+'のIdm番号'+@idm
	--							PRINT @strDelData
	--						END
	--						-- カーソル移動
	--						fetch next from idm_cursor into @pid,@idm
	--					end
	--					-- カーソルを閉じる
	--					close idm_cursor
	--					-- カーソルを解放
	--					deallocate idm_cursor
	--				-- カーソル移動
	--				fetch next from temp_cursor into @tid,@staff
	--			end              
	--    	-- カーソルを閉じる
	--	    close temp_cursor
	--		-- カーソルを解放
	--		deallocate temp_cursor

	--	-- 必要なくなった一時テーブルを削除
	--	drop table #delstaffTable
	--	drop table #delIdmTable
--	END
--    COMMIT TRANSACTION       --トランザクションを確定
--END TRY


--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH

RETURN

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_300201]
    @companyPass NVARCHAR(50),
    @loginAccount NVARCHAR(50)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 会社番号の抽出
            SELECT
                companyID
            FROM MK_company
            WHERE 
                companyPass = @companyPass AND
                loginAccount = @loginAccount
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_300202]
    @staffID NVARCHAR(20),
    @companyID NVARCHAR(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- スタッフ氏名の抽出
            SELECT
                name
            FROM MK_staff
            WHERE
                staffID = @staffID AND
                companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_300203]
    @staffID NVARCHAR(20),
    @companyID NVARCHAR(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 登録済みデータのチェック
            SELECT *
            FROM MK_smartPhone
            WHERE
                staffID = @staffID AND
                name = N'card' AND
                companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_300204]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @idm NVARCHAR(16)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- カード情報の登録
            INSERT INTO MK_smartPhone(
                companyID,
                staffID,
                idm,
                name,
                registerID,
                entryDate,
                UUID
            ) VALUES(
                @companyID,
                @staffID,
                @idm,
                N'card',
                '',
                SYSDATETIME(),
                ''
            )
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_300205]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @idm NVARCHAR(16)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- カード情報登録のチェック
            SELECT
                count(*) AS commitCount
            FROM
                MK_smartPhone
            WHERE
                companyID=@companyID AND
                staffID=@staffID AND
                idm=@idm AND
                name=N'card'
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_300501]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @password NVARCHAR(20)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		--権限取得
		SELECT 
			admCD		
		FROM 
			MK_staff		
		WHERE 
			(companyID = @companyID) 
			AND 
			(staffID = @staffID) 
			AND 
			(password = @password)		
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_300601]
    @companyID NVARCHAR(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		--打刻場所のリスト取得
		SELECT 
			*
		FROM 
			MK_dakokuPoint	
		WHERE 
			companyID = @companyID
			AND delFlag <> 1
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_Common01]
--パラメーター
 @today nvarchar(10),
 @companyID nvarchar(4),
 @sendStaff nvarchar(20)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		DECLARE @varSQL VARCHAR(max)
		DECLARE @addWhere nvarchar(max) = ''
		IF @sendStaff <>''
		SET @addWhere = ' AND MK_smartPhone.staffID = '''+@sendStaff+''' '
	
            -- 共通マッピング1：スマホレジスタIDの取得
            SET @varSQL = 
            'SELECT '+
                'MK_smartPhone.idm, '+
                'MK_smartPhone.staffID, '+
                'MK_smartPhone.registerID, '+
                'MK_smartPhone.name '+
            'FROM MK_smartPhone '+
            'INNER JOIN MK_staff ON '+
                'MK_smartPhone.staffID = MK_staff.staffID AND '+
                'MK_smartPhone.companyID = MK_staff.companyID '+
            'WHERE '+
                'MK_smartPhone.companyID =N''' + @companyID + ''' AND '+
                'MK_smartPhone.name <> N''card'' AND '+
                'MK_smartPhone.registerID<>N'''' AND '+
                'MK_smartPhone.registerID<>N''logout'' AND '+
                'MK_smartPhone.registerID IS NOT NULL AND '+
			    '( '+
                    'MK_staff.retireDate > ''' + @today + ''' OR '+
                    'MK_staff.retireDate IS NULL OR '+
                    'MK_staff.retireDate = '''' '+
                ') '+
			    @addWhere +
                'ORDER BY '+
                    'MK_smartPhone.staffID '
				--SQL実行
			EXEC (@varSQL)
        END
    COMMIT TRANSACTION       --トランザクションを確定
END TRY

--例外処理
BEGIN CATCH
    ROLLBACK TRANSACTION     --トランザクションを取り消し
    PRINT ERROR_MESSAGE()    --エラー内容を戻す
    PRINT 'ROLLBACK TRANSACTION'
END CATCH
 --PRINT @varSQL
RETURN





SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[ver_2_5_Common02]
--パラメーター
 @companyID nvarchar(4),
 @postID nvarchar(2)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 共通マッピング2：所属部署グループの取得
            IF @postID <> '-1'
                SELECT
                    ISNULL(MK_post.postName,'') AS postName,
                    MK_post.postID
                FROM MK_post
                WHERE
                    companyID=@companyID AND
                    postID=@postID
                ORDER BY
                    MK_post.postName ASC
            ELSE
                SELECT
                    ISNULL(MK_post.postName,'') AS postName,
                    MK_post.postID
                FROM MK_post
                WHERE
                    companyID=@companyID
                ORDER BY
                    MK_post.postName ASC
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





GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_Common03]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 共通マッピング3：雇用形態の取得
			SELECT 
				ISNULL(MK_kubun.kubunName,'')AS kubunName,
			    MK_kubun.kubun
		    FROM
				MK_kubun
			WHERE 
				companyID =@companyID
			ORDER BY 
				MK_kubun.kubunName ASC

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

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[ver_2_5_Common04]
--パラメーター
 @companyID nvarchar(4),
 @postID nvarchar(2)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 共通マッピング4：スタッフ番号とスタッフ氏名の取得
            IF @postID <> '-1'
                SELECT
                    DISTINCT ISNULL(MK_staff.name, '')AS name,
                    staffID,
                    ISNULL(kana, '')AS kana
                FROM
                    MK_staff
                WHERE
                    companyID=@companyID AND
                    postID=@postID
            ELSE
                SELECT
                    DISTINCT ISNULL(MK_staff.name, '')AS name,
                    staffID,
                    ISNULL(kana, '')AS kana
                FROM
                    MK_staff
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

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_Common05]
--パラメーター
 @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            -- 共通マッピング5：勤務パターンの取得
			SELECT 
				ISNULL(MK_pattern.memo,'')AS patternName,
			    MK_pattern.patternNo
		    FROM 
				MK_pattern
			WHERE 
				companyID =@companyID
			ORDER BY 
				MK_pattern.memo ASC

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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_GetCompany]
--パラメーター
  @loginAccount nvarchar(50)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        SELECT *
        FROM MK_company
        WHERE
            loginAccount=@loginAccount
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_GetEmail]
--パラメーター
  @email nvarchar(255)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        SELECT *
        FROM MK_staff
		WHERE
			email=@email
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_GetPersonal]
--パラメーター
  @staff nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        SELECT *
        FROM MK_kojinSet
		WHERE
            staffID=@staff AND
            companyID=@companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_GetStaff]
--パラメーター
  @appTourokuID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        SELECT
            MK_staff.staffID,
            MK_staff.name
        FROM MK_staff
        WHERE
            (MK_staff.appTourokuID=@appTourokuID) AND
            (MK_staff.companyID=@companyID)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_History]
--パラメーター
  @companyID nvarchar(4),
  @externNo int,
  @today nvarchar(10)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
		--削除したヒストリーテーブルデータの存在チェック
        SELECT
               count(*) AS commitCount
        FROM   MK_history
		WHERE  
			(companyID =@companyID) AND 
			(externNo = @externNo)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_release01]
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_SetPersonal]
  @staffID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		DECLARE @personalCount int
            -- DB存在チェック
            SELECT
               @personalCount= COUNT(staffID)
            FROM MK_kojinSet
            WHERE
                staffID=@staffID AND
                companyID=@companyID

			-- DBに勤怠データが存在する時
			BEGIN
			IF @personalCount > 0
				UPDATE MK_kojinSet
				SET
					companyID=@companyID,
					staffID=@staffID,
					holiday='0',
					weekday='0'
													
				WHERE
					staffID=@staffID AND
					companyID=@companyID						
			ELSE
				--勤怠データが無い時は新規登録
				INSERT INTO MK_kojinSet(
					companyID,										
					staffID,										
					holiday,										
					weekday
				)										
				 VALUES(
					@companyID,			
					@staffID,
					'0',
					'0'
				)									
			END
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_SetSmartPhone]
  @staffID nvarchar(20),
  @companyID nvarchar(4),
  @registerID nvarchar(255),
  @entryDate datetime,
  @tanmatuName nvarchar(255),
  @udid nvarchar(255)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		DECLARE @count int
            -- DB存在チェック
            SELECT
               @count= COUNT(companyID)
            FROM MK_smartPhone
            WHERE
                staffID=@staffID AND
                companyID=@companyID AND
                registerID=@registerID

			-- DBに勤怠データが存在する時
			BEGIN
			IF @count > 0
				UPDATE MK_smartPhone
				SET
					entryDate=@entryDate
				WHERE
					staffID=@staffID AND
					companyID=@companyID AND				
					registerID=@registerID
			ELSE
				--勤怠データが無い時は新規登録
				INSERT INTO MK_smartPhone(
					name,
					staffID,
					registerID,
					entryDate,
					companyID,
					idm,
					UUID
				)										
				 VALUES(
					@tanmatuName,
					@staffID,
					@registerID,
					@entryDate,
					@companyID,
					'',           -- IDMは空白を入れておく
					@udid
				)									
			END
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[ver_2_5_SetStaff]
--パラメーター
  @password nvarchar(50),
  @email nvarchar(255),
  @appTourokuID nvarchar(20),
  @companyID nvarchar(4)
AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
		UPDATE MK_staff
		SET password = @password,
			email = @email
		WHERE 
			appTourokuID = @appTourokuID AND
			companyID = @companyID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_SmartPhone]
    @companyID NVARCHAR(4),
    @staffID NVARCHAR(20),
    @idm NVARCHAR(16),
    @name NVARCHAR(255),
    @registerID NVARCHAR(255),
    @UUID NVARCHAR(255)
AS

BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
            SELECT
				count(*) AS commitCount
            FROM
                MK_smartPhone
            WHERE 
                companyID=@companyID AND
                staffID=@staffID AND
                idm=@idm AND
                name=@name AND
                registerID=@registerID AND
                -- SYSDATETIME(),
                UUID=@UUID
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[ver_2_5_UserLog]
    @companyID NVARCHAR(4),
	@staffID NVARCHAR(20),
	@operation NVARCHAR(255),
	@title NVARCHAR(255)

AS
BEGIN TRY
    BEGIN TRANSACTION        --トランザクションの開始
        BEGIN
		--ユーザーログの登録
		INSERT INTO
			MK_userLog
			(
			companyID,
			staffID,
			loginDateTime,
			operation,
			pageName
			)VALUES(
			@companyID,
			@staffID,
			GETDATE(),
			@operation,
			@title
			)
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[ufnSplitString_WHILE](
	@Input AS NVARCHAR(MAX)
)  
RETURNS @Output TABLE(Value NVARCHAR(MAX))  
AS  
BEGIN  

	IF @Input IS NOT NULL
	BEGIN

		DECLARE @Start	INT = 1,
			@End	INT = CHARINDEX(',', @Input),
			@Len	INT = LEN(@Input);

		WHILE @End > 0
		BEGIN 
       
			INSERT INTO @Output (Value)
			   VALUES(SUBSTRING(@Input, @Start, @End - @Start));
        
			SELECT	@Start = @End + 1,
				@End = CHARINDEX(',', @Input, @Start);

		END

		INSERT INTO @Output (Value)
		   VALUES(SUBSTRING(@Input, @Start, @Len + 1 - @Start));

	END

	RETURN;
	
END 

GO
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
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_calendar](
	[number] [int] NOT NULL,
	[calYmd] [nvarchar](10) NOT NULL,
	[holiday] [int] NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
 CONSTRAINT [PK_MK_calendar] PRIMARY KEY CLUSTERED 
(
	[number] ASC,
	[calYmd] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_calManager](
	[number] [int] NOT NULL,
	[name] [nvarchar](20) NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
 CONSTRAINT [PK_MK_calManager_1] PRIMARY KEY CLUSTERED 
(
	[number] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_category](
	[categoryNo] [int] IDENTITY(1,1) NOT NULL,
	[todoID] [int] NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[statusCD] [int] NULL,
	[startDate] [nvarchar](10) NULL,
	[endDate] [nvarchar](10) NULL,
	[finishDate] [nvarchar](10) NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[bookMark] [int] NULL,
 CONSTRAINT [PK_MK_category] PRIMARY KEY CLUSTERED 
(
	[categoryNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_chat](
	[groupID] [int] NOT NULL,
	[memberID] [nvarchar](20) NOT NULL,
	[chatDateTime] [datetime] NOT NULL,
	[chatLog] [nvarchar](max) NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[id] [int] IDENTITY(1,1) NOT NULL,
	[imageURL] [nvarchar](255) NULL,
 CONSTRAINT [PK_MK_chat_1] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_company](
	[name] [nvarchar](255) NULL,
	[title] [nvarchar](255) NULL,
	[memo] [nvarchar](255) NULL,
	[address] [nvarchar](255) NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[endDate] [int] NULL,
	[companyPass] [nvarchar](50) NOT NULL,
	[loginAccount] [nvarchar](50) NULL,
	[email] [nvarchar](255) NOT NULL,
	[tantoName] [nvarchar](50) NULL,
	[tantoKana] [nvarchar](50) NULL,
	[tel] [nvarchar](50) NULL,
	[shoukai] [nvarchar](255) NULL,
	[buisiness] [nvarchar](4) NULL,
	[staffValue] [nvarchar](50) NULL,
	[freeYmd] [nvarchar](10) NULL,
	[payYmd] [nvarchar](10) NULL,
	[stopYmd] [nvarchar](10) NULL,
	[presTime] [float] NULL,
	[presFlag] [int] NULL,
	[yakinKugiriTime] [float] NULL,
	[faxEmail] [nvarchar](255) NULL,
 CONSTRAINT [PK_MK_company] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_csvFormat](
	[companyID] [nvarchar](4) NOT NULL,
	[patternNo] [int] NOT NULL,
	[masterNo] [int] NOT NULL,
	[displayOrder] [int] NOT NULL,
	[settingName] [nvarchar](50) NULL,
	[formatName] [nvarchar](50) NOT NULL,
	[itemOutput] [int] NOT NULL,
	[timeFormat] [int] NOT NULL,
	[displayFormat] [int] NOT NULL,
	[totalUnit] [int] NOT NULL,
 CONSTRAINT [PK_MK_csvFormat_1] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[patternNo] ASC,
	[masterNo] ASC,
	[displayOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_csvMaster](
	[patternNo] [int] NOT NULL,
	[masterNo] [int] NOT NULL,
	[displayOrder] [int] NOT NULL,
	[masterName] [nvarchar](50) NOT NULL,
	[formatName] [nvarchar](50) NULL,
 CONSTRAINT [PK_MK_csvMaster] PRIMARY KEY CLUSTERED 
(
	[patternNo] ASC,
	[masterNo] ASC,
	[displayOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_dakokuPoint](
	[companyID] [nvarchar](4) NOT NULL,
	[pointNo] [int] NOT NULL,
	[pointName] [nvarchar](255) NOT NULL,
	[delFlag] [int] NOT NULL,
	[registDate] [datetime] NOT NULL,
	[registStaff] [nvarchar](20) NOT NULL,
	[updateDate] [datetime] NULL,
	[updateStaff] [nvarchar](20) NULL,
 CONSTRAINT [PK_MK_dakokuPoint] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[pointNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_event](
	[eventNo] [int] IDENTITY(1,1) NOT NULL,
	[sakuseiDate] [datetime] NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[title] [nvarchar](255) NOT NULL,
	[subTitle] [nvarchar](255) NOT NULL,
	[keisaiKigen] [nvarchar](10) NOT NULL,
	[note] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_MK_event] PRIMARY KEY CLUSTERED 
(
	[eventNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_faxSend](
	[faxDateTime] [datetime] NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[faxFlag] [int] NOT NULL,
	[subject] [nvarchar](255) NULL,
	[imagePass] [nvarchar](255) NULL,
	[faxID] [int] NOT NULL,
	[faxKyoten] [nvarchar](3) NULL,
 CONSTRAINT [PK_MK_faxSend] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[faxID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_group](
	[groupID] [int] NOT NULL,
	[groupName] [nvarchar](255) NOT NULL,
	[icon] [nvarchar](255) NULL,
	[companyID] [nvarchar](4) NOT NULL,
 CONSTRAINT [PK_MK_group] PRIMARY KEY CLUSTERED 
(
	[groupID] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_history](
	[historyNo] [int] IDENTITY(1,1) NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[category] [int] NOT NULL,
	[ymdTime] [datetime] NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[groupID] [int] NULL,
	[flag] [int] NOT NULL,
	[externNo] [int] NULL,
 CONSTRAINT [PK_MK_history] PRIMARY KEY CLUSTERED 
(
	[historyNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_historyOption](
	[historyNo] [int] IDENTITY(1,1) NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[category] [int] NOT NULL,
	[ymdTime] [datetime] NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[flag] [int] NOT NULL,
	[externNo] [int] NULL,
	[okiniFlag] [int] NULL,
 CONSTRAINT [PK_MK_historyOption] PRIMARY KEY CLUSTERED 
(
	[historyNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_kintai](
	[companyID] [nvarchar](4) NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[ymd] [nvarchar](10) NOT NULL,
	[kintaiNo] [int] NOT NULL,
	[youbi] [nvarchar](2) NULL,
	[inOffice] [float] NULL,
	[maruInOffice] [float] NULL,
	[outOffice] [float] NULL,
	[maruOutOffice] [float] NULL,
	[restTime] [float] NULL,
	[memo] [nvarchar](255) NULL,
	[underTime] [float] NULL,
	[inTime] [float] NULL,
	[overTime] [float] NULL,
	[outTime] [float] NULL,
	[midnight] [float] NULL,
	[id] [int] NULL,
	[yakinFlag] [int] NULL,
	[inPosition] [nvarchar](255) NULL,
	[inPositionAdd] [nvarchar](255) NULL,
	[outPosition] [nvarchar](255) NULL,
	[outPositionAdd] [nvarchar](255) NULL,
	[inPointNo] [int] NULL,
	[outPointNo] [int] NULL,
 CONSTRAINT [PK_MK_kintai] PRIMARY KEY CLUSTERED 
(
	[staffID] ASC,
	[ymd] ASC,
	[kintaiNo] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_kojinSet](
	[companyID] [nvarchar](4) NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[startPermit] [float] NULL,
	[endPermit] [float] NULL,
	[holiday] [int] NOT NULL,
	[weekday] [int] NOT NULL,
 CONSTRAINT [PK_MK_kojinSet] PRIMARY KEY CLUSTERED 
(
	[staffID] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_kubun](
	[companyID] [nvarchar](4) NOT NULL,
	[kubun] [nvarchar](2) NOT NULL,
	[kubunName] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_MK_kubun] PRIMARY KEY CLUSTERED 
(
	[kubun] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_kyoten](
	[companyID] [nvarchar](4) NOT NULL,
	[faxKyoten] [nvarchar](3) NOT NULL,
	[kyotenEmail] [nvarchar](255) NOT NULL,
	[sendFlag] [int] NOT NULL,
 CONSTRAINT [PK_MK_kyoten] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[faxKyoten] ASC,
	[kyotenEmail] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_member](
	[memberID] [nvarchar](20) NOT NULL,
	[groupID] [int] NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
 CONSTRAINT [PK_MK_member] PRIMARY KEY CLUSTERED 
(
	[memberID] ASC,
	[groupID] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_pattern](
	[companyID] [nvarchar](4) NOT NULL,
	[patternNo] [int] NOT NULL,
	[postID] [nvarchar](2) NULL,
	[kubun] [nvarchar](2) NULL,
	[startWork] [float] NOT NULL,
	[endWork] [float] NOT NULL,
	[startMarume] [float] NULL,
	[endMarume] [float] NULL,
	[goReternMarume] [float] NULL,
	[restMarume] [float] NULL,
	[endDate] [int] NOT NULL,
	[memo] [nvarchar](255) NULL,
	[pattern_none_flag] [int] NOT NULL,
	[pattern_none_1] [float] NULL,
	[pattern_none_2] [float] NULL,
	[pattern_none_3] [float] NULL,
 CONSTRAINT [PK_MK_pattern] PRIMARY KEY CLUSTERED 
(
	[patternNo] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_post](
	[companyID] [nvarchar](4) NOT NULL,
	[postID] [nvarchar](2) NOT NULL,
	[postName] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_MK_post] PRIMARY KEY CLUSTERED 
(
	[postID] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_salaryItem](
	[masterNo] [int] NOT NULL,
	[displayOrder] [int] NOT NULL,
	[masterName] [nvarchar](50) NOT NULL,
 CONSTRAINT [PK_MK_salaryItem] PRIMARY KEY CLUSTERED 
(
	[masterNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_shift](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[ymd] [nvarchar](10) NOT NULL,
	[inOffice] [float] NOT NULL,
	[outOffice] [float] NOT NULL,
	[restTime] [float] NOT NULL,
	[startMarume] [float] NOT NULL,
	[endMarume] [float] NOT NULL,
	[hayadeFlag] [int] NOT NULL,
	[holiday] [int] NOT NULL,
 CONSTRAINT [PK_MK_shift] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_sinsei](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[sinseiNo] [int] NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[sinseiStaffID] [nvarchar](20) NOT NULL,
	[shoninStaffID] [nvarchar](20) NOT NULL,
	[commitStaffID] [nvarchar](20) NULL,
	[kintaiNo] [int] NULL,
	[sinseiKubun] [int] NOT NULL,
	[todokedeID] [int] NULL,
	[shoninFlag] [int] NOT NULL,
	[sinseiDate] [nvarchar](10) NOT NULL,
	[shoninDate] [nvarchar](10) NULL,
	[taishouDate] [nvarchar](10) NULL,
	[hayadeFlag] [int] NULL,
	[inOffice] [float] NULL,
	[outOffice] [float] NULL,
	[restTime] [float] NULL,
	[sinseiRiyu] [nvarchar](100) NOT NULL,
	[kyakkaRiyu] [nvarchar](100) NULL,
 CONSTRAINT [PK_MK_sinsei] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_smartPhone](
	[companyID] [nvarchar](4) NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[idm] [nvarchar](16) NOT NULL,
	[name] [nvarchar](255) NOT NULL,
	[registerID] [nvarchar](255) NOT NULL,
	[entryDate] [datetime] NOT NULL,
	[UUID] [nvarchar](255) NULL,
 CONSTRAINT [PK_MK_smartPhone] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[idm] ASC,
	[registerID] ASC,
	[entryDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_staff](
	[companyID] [nvarchar](4) NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[name] [nvarchar](21) NULL,
	[kana] [nvarchar](41) NULL,
	[postID] [nvarchar](2) NULL,
	[kubun] [nvarchar](2) NULL,
	[entDate] [nvarchar](10) NULL,
	[retireDate] [nvarchar](10) NULL,
	[birthdayFlag] [int] NULL,
	[birthday] [nvarchar](10) NULL,
	[email] [nvarchar](255) NULL,
	[url] [nvarchar](255) NULL,
	[password] [nvarchar](50) NULL,
	[patternNo] [int] NOT NULL,
	[memo] [nvarchar](255) NULL,
	[admCD] [int] NULL,
	[calendarID] [int] NULL,
	[appTourokuID] [nvarchar](20) NULL,
	[faxRec] [nvarchar](255) NULL,
	[GPS] [int] NULL,
 CONSTRAINT [PK_MK_staff] PRIMARY KEY CLUSTERED 
(
	[staffID] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_system](
	[versionURL] [nvarchar](255) NOT NULL,
	[VBversionTitle] [nvarchar](50) NOT NULL,
	[versionValue] [nvarchar](50) NOT NULL,
	[iPhoneVer] [nvarchar](10) NULL,
	[androidVer] [nvarchar](10) NULL,
	[vbDotNet] [nvarchar](10) NULL,
	[no] [int] NOT NULL,
 CONSTRAINT [PK_MK_system] PRIMARY KEY CLUSTERED 
(
	[versionURL] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_timeTable](
	[companyID] [nvarchar](4) NOT NULL,
	[patternNo] [int] NOT NULL,
	[timeTableNo] [int] NOT NULL,
	[startRest] [float] NOT NULL,
	[endRest] [float] NOT NULL,
 CONSTRAINT [PK_MK_timeTable] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[patternNo] ASC,
	[timeTableNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_todo](
	[companyID] [nvarchar](4) NOT NULL,
	[todoID] [int] NOT NULL,
	[priorityCD] [int] NULL,
	[todoTitle] [nvarchar](255) NOT NULL,
	[todo] [nvarchar](255) NOT NULL,
	[staffID] [nvarchar](20) NULL,
	[todoDate] [nvarchar](10) NOT NULL,
	[keisaiKigen] [nvarchar](10) NOT NULL,
 CONSTRAINT [PK_MK_todo] PRIMARY KEY CLUSTERED 
(
	[todoID] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MK_todokede](
	[todokedeID] [int] NOT NULL,
	[todokedeKubun] [int] NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[todokedeName] [nvarchar](20) NOT NULL,
	[labelName] [nvarchar](20) NOT NULL,
 CONSTRAINT [PK_MK_todokede] PRIMARY KEY CLUSTERED 
(
	[todokedeID] ASC,
	[todokedeKubun] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[MK_userLog](
	[logNo] [int] IDENTITY(1,1) NOT NULL,
	[companyID] [nvarchar](4) NOT NULL,
	[staffID] [varchar](20) NOT NULL,
	[loginDateTime] [datetime] NOT NULL,
	[operation] [nvarchar](255) NOT NULL,
	[pageName] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_MK_userLog] PRIMARY KEY CLUSTERED 
(
	[logNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
USE [master]
GO
ALTER DATABASE [gaia_ik] SET  READ_WRITE 
GO
