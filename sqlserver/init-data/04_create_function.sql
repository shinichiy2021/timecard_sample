USE [dev]
GO
/****** Object:  UserDefinedFunction [dbo].[ufnSplitString_WHILE]    Script Date: 2020/02/20 15:31:47 ******/
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
