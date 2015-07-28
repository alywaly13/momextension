var quote;
var background;

function setColor(isNew){
document.body.style.backgroundColor='lightgreen';
if (isNew){
    var imageNumber = Math.floor(Math.random()*17 + 1);
    var imageName = "bgimage" + imageNumber + ".jpg";
    localStorage.setItem("imageName", imageName);

}
else{
    var imageName = localStorage.getItem("imageName");
}
document.body.style.backgroundImage = "url(images/" + imageName + ")";
}

function setWeather(){
   $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20" + 
                    "where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22memphis%2C%20tn%22)" + 
                    "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys", "",
    function (data)
    {
            $("#weather1").append(data.query.results.channel.item.description);
    });
   $.getJSON("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20" + 
                    "where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22boston%2C%20ma%22)" + 
                    "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys", "",
    function (data)
    {
            $("#weather2").append(data.query.results.channel.item.description);
    });
}

function setListeners(){
	$("#maintext").hover(function(){
        $("#mythoughts").show();
    }, function(){
        $("#mythoughts").hide();
    });

    $("#settingsimage").click(function(){
        $("#settingsdd").toggle();
    });

   $("li").hover(function(){
        $(this).css("background-color","rgba(106, 117, 128, 0.9)");
    },
    function(){
        $(this).css("background-color","rgba(106, 117, 128, 0.5)");
    });
}

  function shrink()
    {
    	/*while( $('#maintext div').height() > $('#maintext').height() ) {
    		$('#maintext div').style.fontSize = parseInt(textSpan)
        $('#maintext div').css('font-size', (parseInt($('#maintext div').css('font-size')) - 1) + "px" );
    	}*/
    	var textDiv = document.getElementById("maintext");
        textDiv.style.fontSize = "60px";
    	while(textDiv.offsetHeight > 110)
    	{
          //  window.alert(textDiv.offsetHeight + " fontsize " + textDiv.style.fontSize);
    		textDiv.style.fontSize = parseInt(textDiv.style.fontSize) - 2;
    	}
    }

function setSong(isNew){
    var songsources = [
    "https://ia800500.us.archive.org/33/items/TheBestDay/TheBestDay_64kb.mp3",
    "http://a.tumblr.com/tumblr_lcdjykoUk81qbfuy9o1.mp3",
    "https://stream.song365.co/h/1141/Pharrell%20Williams%20-%20Happy_(song365.cc).mp3",
    "http://pyppet.com/audio/67764644/26354247/Secret_Garden-Sleepsong.mp3",
    "http://qzone.haoduoge.com/music/A38726UJUM49424EBF6F50A17A8B7034D2979.mp3",
    "songs/yigeren.mp3",
    "songs/wiggle.mp3",
    "songs/twinkle.mp3",
    "songs/sunofjamaica.mp3",
    "songs/nevergrowup.mp3",
    "songs/jaychou.mp3",
    "songs/mostromantic.mp3",
    "songs/xiangfeng.mp3",
    "songs/lovestory.mp3",
    "songs/jiaxiang.mp3",
    "songs/belong.mp3",
    "songs/tianlu.mp3",
    "songs/qianshou.mp3"
    ];
    var songsrc;
    if (isNew){
        songsrc = songsources[Math.floor(Math.random()*songsources.length)];
        localStorage.setItem("songsrc", songsrc);

    }
    else{
        songsrc = localStorage.getItem("songsrc");
    }
    $("#songsource").attr("src", songsrc);

}

function checkBirthday(currentDate){
    if (currentDate==628){
        $("#maintext").text("HAPPY BIRTHDAY PEIHONG!!!! Mouse over me for more information.");
        $("#mythoughts").text("这是一个专门给我妈妈做的一个Chrome Extension. 每天会有一个背景，一个小quote,还有可能有一些我想分享的话(Mouse over the quote to see).希望你喜欢！");
        document.body.style.backgroundImage = "url(images/birthday.jpg)";
        $("#songsource").attr("src", "songs/birthday.mp3");
    }
}

 function setQuote(isNew){
 	var quotes = [
"When I was a boy of fourteen, my father was so ignorant I could hardly stand to have the old man around. But when I got to be twenty-one, I was astonished at how much the old man had learned in seven years.",
"No man has ever lived that had enough of children's gratitude or woman's love.",
"We do not develop habits of genuine love automatically. We learn by watching effective role models, most specifically by observing how our parents express love for each other day in and day out.", 
"Home is where you are loved the most and act the worst.", 
"It didn't matter how big our house was; it mattered that there was love in it.", 
"That's what people do who love you. They put their arms around you and love you when you're not so lovable.", 
"The best inheritance a parent can give to his children is a few minutes of their time each day.", 
"I realized my family was funny, because nobody ever wanted to leave our house.", 
"Family faces are magic mirrors. Looking at people who belong to us, we see the past, present, and future.",
"Family is a blessing. Just keep saying that when you are irritated by something a family member says.",
"Family is just accident. They don’t mean to get on your nerves. They don’t even mean to be your family, they just are.", 
"I smile because you're my family. I laugh because there's nothing you can do about it.", 
"The most romantic story isn't Romeo and Juliet who died together, it's grandma and grandpa who grew old together.", 
"Watching your daughter being collected by her date feels like handing over a million dollar Stradivarius to a gorilla.", 
"Our family is like the branches of a tree. We may grow in different directions, yet our roots remain as one.", 
"Family: We may not have it all together, but together we have it all.", 
"Sometimes you will never know the true value of a moment until it becomes a memory",
"Home is where Mom is",
"Nothing is ever lost until Mom can't find it.",
"The best moms get promoted to grandmas",
"If the days won’t allow us to see each other, memories will, and if my eyes can’t see you, my heart will never forget you."
];

var thoughts = [
"这段引文表达了很多孩子的想法。我们年轻的时候,总是觉得自己什么都知道,可是我现在看到父母说的很多其实都很有道理,也都是为我好。希望我永远能好好听爸爸妈妈说的话！",
"",
"你们两个彼此的爱情教了我以后应该寻找什么样的丈夫. 你们俩的爱对我有了很大的影响,给了我个幸福,完整的家庭.",
"这个引文说得太对了.因为我们知道,无论如何总会得到家人的爱,所以有时候忘记把我们自己心里的爱表现出来.这就是家庭的奇妙.",
"",
"",
"",
"我记得,快要上大学的时候我周围的朋友们都多激动,好想早点离开家.可是我一直都不舍得离开爱我的父母,离开我幸福的家.而到了大学还是总盼望着能回家的时刻,因为我的家庭是世界上最棒的!",
"",
"",
"", 
"", 
"看到你们两个的婚姻总是让我很开心。希望我以后也能像你们一样，有一个成功的婚姻，因为我能想到最浪漫的事，就是和一个爱我的男人一起慢慢变老。", 
"不知你们知道Stradivarius是什么；是一个非常高贵的小提琴，值很多钱。我想你们看我和男朋友就是这样的，我也懂你们的心。在你们眼里，我非宝贵，我只是希望一天能找到一个你们认为值得我的男人。", 
"", 
"", 
"谢谢你们陪着我玩儿，给了我许多快乐，美好的会议！",
"",
"谢谢你这十九年一直关心着我，那么细心的爱我。",
"",
"虽然我们经常不在一起，我的心永远是你的。我爱你！"
];
    var quoteIndex;
    if (isNew){
        quoteIndex = Math.floor(Math.random()*quotes.length);
        localStorage.setItem("quoteIndex", quoteIndex);
    }
    else{
        quoteIndex = localStorage.getItem("quoteIndex");
    }
	$("#maintext").text(quotes[quoteIndex]);
    $("#mythoughts").text(thoughts[quoteIndex]);
 }


 $(document).ready(function(){
    $("#mythoughts").hide();
    $("#settingsdd").hide();
    storedDate = localStorage.getItem("date");
    var today = new Date();
    var currentDate = today.getMonth().toString() + today.getDate().toString();
    currentDate='628';
 /*       if (currentDate==storedDate){
        //We've already opened this thing once today. 
        setColor(false);
        setQuote(false);
        setSong(false);
    }
    else{*/
        //We're opening for the first time, so set stuff. 
        setColor(true);
        setQuote(true);
        setSong(true);
        localStorage.setItem("date", currentDate);
    //}
    setListeners();
    checkBirthday(currentDate);
    setWeather();
    shrink();
});

 

