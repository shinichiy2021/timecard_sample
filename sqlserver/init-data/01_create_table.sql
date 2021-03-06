USE [dev]
GO
/****** Object:  Table [dbo].[kintaiLog]    Script Date: 2020/02/20 15:29:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[kintaiLog](
	[companyID] [nvarchar](4) NOT NULL,
	[editStaff] [nvarchar](20) NOT NULL,
	[editDateTime] [datetime] NOT NULL,
	[operationFlg] [int] NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[ymd] [nvarchar](10) NOT NULL,
	[kintaiNo] [int] NOT NULL,
	[inOffice] [float] NULL,
	[outOffice] [float] NULL,
	[restTime] [float] NULL,
	[inPositionAdd] [nvarchar](255) NULL,
	[outPositionAdd] [nvarchar](255) NULL,
	[inPointNo] [int] NULL,
	[outPointNo] [int] NULL,
 CONSTRAINT [PK_kintaiLog] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[editStaff] ASC,
	[editDateTime] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[MK_buisiness]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_calendar]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_calManager]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_category]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_chat]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_company]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_csvFormat]    Script Date: 2020/02/20 15:29:41 ******/
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
 CONSTRAINT [PK_MK_csvFormat] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[patternNo] ASC,
	[masterNo] ASC,
	[displayOrder] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[MK_csvMaster]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_dakokuPoint]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_event]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_faxSend]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_group]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_history]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_historyOption]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_kintai]    Script Date: 2020/02/20 15:29:41 ******/
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
	[id] [int] IDENTITY(1,1) NOT NULL,
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
/****** Object:  Table [dbo].[MK_kojinSet]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_kubun]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_kyoten]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_member]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_pattern]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_post]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_salaryItem]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_shift]    Script Date: 2020/02/20 15:29:41 ******/
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
 CONSTRAINT [PK__MK_shift__3213E83F206BC486] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[MK_sinsei]    Script Date: 2020/02/20 15:29:41 ******/
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
 CONSTRAINT [MK_sinseiTime_id_pk] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[MK_smartPhone]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_staff]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_system]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_timeTable]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_todo]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[MK_todokede]    Script Date: 2020/02/20 15:29:41 ******/
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
 CONSTRAINT [MK_rest_companyID_restID_pk] PRIMARY KEY CLUSTERED 
(
	[todokedeID] ASC,
	[todokedeKubun] ASC,
	[companyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[MK_userLog]    Script Date: 2020/02/20 15:29:41 ******/
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
/****** Object:  Table [dbo].[staffLog]    Script Date: 2020/02/20 15:29:41 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[staffLog](
	[companyID] [nvarchar](4) NOT NULL,
	[editStaff] [nvarchar](20) NOT NULL,
	[editDateTime] [datetime] NOT NULL,
	[operationFlg] [int] NOT NULL,
	[staffID] [nvarchar](20) NOT NULL,
	[name] [nvarchar](21) NULL,
	[kana] [nvarchar](41) NULL,
	[postID] [nvarchar](2) NULL,
	[kubun] [nvarchar](2) NULL,
	[entDate] [nvarchar](10) NULL,
	[retireDate] [nvarchar](10) NULL,
	[birthday] [nvarchar](10) NULL,
	[email] [nvarchar](255) NULL,
	[patternNo] [int] NOT NULL,
	[memo] [nvarchar](255) NULL,
	[admCD] [int] NOT NULL,
	[calendarID] [int] NOT NULL,
	[faxRec] [nvarchar](255) NULL,
	[GPS] [int] NOT NULL,
 CONSTRAINT [PK_staffLog] PRIMARY KEY CLUSTERED 
(
	[companyID] ASC,
	[editStaff] ASC,
	[editDateTime] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'シフトテーブル（トランザクション）' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MK_shift'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'申請テーブル（トランザクション）' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MK_sinsei'
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'休暇テーブル（マスター）' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'MK_todokede'
GO
