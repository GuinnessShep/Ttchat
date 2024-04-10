
// This will use the demo backend if you open index.html locally via file://, otherwise your server will be used
let backendUrl = location.protocol === 'file:' ? "https://tiktok-chat-reader.zerody.one/" : undefined;
let connection = new TikTokIOConnection(backendUrl);
let socket = io();
// (A) LOAD FILE SYSTEM MODU
// Counter
let viewerCount = 0;
let likeCount = 0;
let diamondsCount = 0; let usernames = {};
let userIds = {};
let gifter_ary = [];
let link_ary = {};
let roomId = '';
let uniqueId = '';
let roomDisplayId = '';
let roomDisplayNickname = '';
let roomStart = '';
let roomEnd = '';

let playSounds = 1;
let saveGifts = 1;
let voiceComments = 1;

let ttn = [];

String.prototype.removeLast = function(n) {
	var string = this.split('')
	string.length = string.length - n
	return string.join('')
}

let playingSound = false, soundQue = []
function addToQue(url){
	if(playingSound == false){
		playingSound = true
	} else {

	}
}

function hasClass(elem, className) {
	return elem.classList.contains(className);
}

function calcDate(date1, date2) {
	/*
	* calcDate() : Calculates the difference between two dates
	* @date1 : "First Date in the format MM-DD-YYYY"
	* @date2 : "Second Date in the format MM-DD-YYYY"
	* return : Array
	*/

	//new date instance
	const dt_date1 = new Date(date1);
	const dt_date2 = new Date(date2);

	//Get the Timestamp
	const date1_time_stamp = dt_date1.getTime();
	const date2_time_stamp = dt_date2.getTime();

	let calc;

	//Check which timestamp is greater
	if (date1_time_stamp > date2_time_stamp) {
		calc = new Date(date1_time_stamp - date2_time_stamp);
	} else {
		calc = new Date(date2_time_stamp - date1_time_stamp);
	}
	//Retrieve the date, month and year
	const calcFormatTmp = calc.getDate() + '-' + (calc.getMonth() + 1) + '-' + calc.getFullYear();
	//Convert to an array and store
	const calcFormat = calcFormatTmp.split("-");
	//Subtract each member of our array from the default date
	const days_passed = Number(Math.abs(calcFormat[0]) - 1);
	const months_passed = Number(Math.abs(calcFormat[1]) - 1);
	const years_passed = Number(Math.abs(calcFormat[2]) - 1970);

	//Set up custom text
	const yrsTxt = ["year", "years"];
	const mnthsTxt = ["month", "months"];
	const daysTxt = ["day", "days"];

	//Convert to days and sum together
	const total_days = (years_passed * 365) + (months_passed * 30.417) + days_passed;
	const total_secs = total_days * 24 * 60 * 60;
	const total_mins = total_days * 24 * 60;
	const total_hours = total_days * 24;
	const total_weeks = ( total_days >= 7 ) ? total_days / 7 : 0;

	//display result with custom text
	const result = ((years_passed == 1) ? years_passed + ' ' + yrsTxt[0] + ' ' : (years_passed > 1) ?
		years_passed + ' ' + yrsTxt[1] + ' ' : '') +
		((months_passed == 1) ? months_passed + ' ' + mnthsTxt[0] : (months_passed > 1) ?
			months_passed + ' ' + mnthsTxt[1] + ' ' : '') +
		((days_passed == 1) ? days_passed + ' ' + daysTxt[0] : (days_passed > 1) ?
			days_passed + ' ' + daysTxt[1] : '');

	//return the result
	return {
		"total_days": Math.round(total_days),
		"total_weeks": Math.round(total_weeks),
		"total_hours" : Math.round(total_hours),
		"total_minutes" : Math.round(total_mins),
		"total_seconds": Math.round(total_secs),
		"result": result.trim()
	}

}

function generateOverlay() {
	let username = $('#uniqueIdInput').val();
	let url = `/obs.html?username=${username}&showLikes=1&showChats=1&showGifts=1&showFollows=1&showJoins=1&bgColor=rgb(24,23,28)&fontColor=rgb(227,229,235)&fontSize=1.3em`;

	if(username) {
		window.open(url, '_blank');
	} else {
		alert("Enter username");
	}
}

// These settings are defined by obs.html
if (!window.settings) window.settings = {};

function sendToDb(table, state, data){
	/*let letData = {
		table: table,
		state: state,
		room: {
			roomId: roomId,
			uniqueId: uniqueId,
			roomDisplayId: roomDisplayId,
			roomDisplayNickname
		},
		"data": data
	}
	//letData.table = table
	//letData.data = data
	$.ajax({
		type: 'POST',
		url: 'https://somewebsites/api/in.php',
		crossDomain: true,
		data: letData,
		dataType: 'text', //'json',
		success: function(responseData, textStatus, jqXHR) {
			//var value = responseData.someKey;
			//console.log(responseData)
			//console.log('/ response')
			//console.log(textStatus)
			//console.log('/ text')
			//console.log(jqXHR)
			//console.log('/ XHR')
		},
		error: function (responseData, textStatus, errorThrown) {
			console.log('POST failed.');
			console.log(responseData)
			console.log('/ response')
			//console.log(textStatus)
			//console.log('/ text')
			//console.log(jqXHR)
			//console.log('/ XHR')
		}
	});*/
}

function timeConverter(UNIX_timestamp){
	var a = new Date(UNIX_timestamp * 1000);

	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const nthNumber = (number) => {
		if (number > 3 && number < 21) return "th";
		switch (number % 10) {
			case 1:
			return "st";
			case 2:
			return "nd";
			case 3:
			return "rd";
			default:
			return "th";
		}
	};
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	//var sec = a.getSeconds();
	var add0 = min < 10 ? 0 : ''
	var time = month+' '+date+nthNumber(date)+' '+year+' '+hour+':'+add0+min; // + ':' + sec ;
	return time;
}

function loadNote(title){ // , note
	let box = Array.isArray(Config.notes[title]) ? Config.notes[title][0] : Config.notes[title]
	for(const note in Config['notes']){
		if(Config.notes[note].name == title){
			$('#note-id').val(title)
			$('#new-note-name').val(title)
			$('#new-note-info').val(Config.notes[note].note.replace("<br>", "\n"))
			$('#new-note-form').collapse('show')
			//$('#new-note').slideUp('fast')
			$('#delete-note').slideUp('fast', function(){
				$('#delete-note').attr('data-note-title', title)
					.removeClass('d-none').slideDown('fast')
			})
		}
	}
}

function removeGift(th){
	let t = $(th), gift = t.data('name')
	t.closest('li').slideUp()
	socket.emit('removeGiftSound', {
		gift : gift
	})
}

function playSound(th){
	let t = $(th), url = t.data('url')
		, announcement = new Announcement(url);
	t.find('.s-on').removeClass('d-none')
	t.find('.s-off').addClass('d-none')
	announcement.sound();
}


function connect() {
	let uniqueId = window.settings.username || $('#uniqueIdInput').val();

	if(!Config.names.includes(uniqueId)){
		socket.emit('addToNames', {
			name : uniqueId
		})
	}

	if (uniqueId !== '') {
		$('#stateText').text('Connecting...');
		connection.connect(uniqueId, {
			enableExtendedGiftInfo: true
		}).then(state => {
			//$('#stateText').text(`Connected to roomId ${state.roomId}`);
			console.log(' -- state --');
			console.log(state)
			console.log(' -- /state --');
			//<span class="input-group-text" id="stats-viewers">Connected to roomId ${state.roomId}</span>
			roomId = state.roomId
			// for sounds

			display_start = timeConverter(state.roomInfo.create_time)
			$('#HostInfo').html(`
				<div class="row">
					<div class="col-6">
						<div class="fs-4 text-center">
							${state.roomInfo.owner.nickname}
						</div>
						<img class="h-auto rounded-circle float-left me-2" src="${state.roomInfo.owner.avatar_thumb.url_list[0]}">
						<div class="fs-4 text-center">
							@${state.roomInfo.owner.display_id}
							<br>
							Started: ${display_start}
						</div>
					</div>
					<div class="col-6">
						<div class="p-1 m-2 bg-secondary-subtle text-secondary-emphasis border rounded">
							${state.roomInfo.owner.bio_description.replace("\n", "<br>")}
						</div>
					</div>
				</div>`);
			$('#stateText').html('<h4 class="mb-0">Connected</h4>');
			roomDisplayId = state.roomInfo.owner.display_id;
			roomDisplayNickname = state.roomInfo.owner.nickname;
			roomStart = state.roomInfo.create_time

			document.title = roomDisplayId+' - Yohns TikTok Live Chat Analytics Demo Beta 3';

			let all_fans = state.roomInfo.top_fans
				, total_fans = all_fans.length
				, fan_tr = '';
			if(total_fans > 0){
				for(var i=0;i<total_fans;i++){
					let tick = parseInt(state.roomInfo.top_fans[i].fan_ticket).toLocaleString('en')
					fan_tr += `
					<li id="topGiftersDivider"><hr class="dropdown-divider"></li>
					<li><a class="dropdown-item" href="https://tiktok.com/@${state.roomInfo.top_fans[i].user.display_id}" target="_blank">
						<img alt="top gifters pic" class="h-auto rounded-circle" style="width:45px; max-width:45px;" src="${state.roomInfo.top_fans[i].user.avatar_thumb.url_list[0]}">
						${state.roomInfo.top_fans[i].user.nickname}
						<small>(${tick} coins)</small>
					</a></li>`;
					//fan_tr += '<tr><td><a href="'+state.roomInfo.top_fans[i].user.display_id+'"><img src="'+state.roomInfo.top_fans[i].user.avatar_thumb.url_list[0]+'" alt="top gifters pic" class="h-auto rounded-circle" style="width:45px; max-width:45px;"></a></td><td><a href="'+state.roomInfo.top_fans[i].user.display_id+'">'+state.roomInfo.top_fans[i].user.nickname+'</a></td><td>'+state.roomInfo.top_fans[i].fan_ticket+' coins</td></tr>';
				}
				$(fan_tr).insertAfter("#topGiftersDivider")
				//document.getElementById('topGiftersDivider').innerHTML = fan_tr
			}
			// reset stats
			viewerCount = 0;
			likeCount = 0;
			diamondsCount = 0;
			updateRoomStats();

			let g_length = state.availableGifts.length, ii, allGifts = [], html = ''
			, giftDrop = '';
			for(ii=0;ii<g_length;ii++){
				let list = {
					id: state.availableGifts[ii].id,
					diamond_count: state.availableGifts[ii].diamond_count,
					name: state.availableGifts[ii].name,
					describe: state.availableGifts[ii].describe,
					uri: state.availableGifts[ii].icon.uri,
					url: state.availableGifts[ii].icon.url_list[0],
				}
				allGifts.push(list) //state.availableGifts[i]
				giftDrop += '<option value="'+state.availableGifts[ii].name+'">'
					+state.availableGifts[ii].name+' ('+state.availableGifts[ii].diamond_count+') coins'
					+'</option>'
			}
			console.log(allGifts)
			$('#group-gift').html(giftDrop)
			$('#save-gift-sound').attr('disabled', false)
			//sendToDb('gifts', 'check', allGifts)

			if(roomDisplayId in usernames){} else {
				usernames[roomDisplayId] = {
					userId : state.roomInfo.owner.id_str,
					uniqueId : roomDisplayId,
					nickname : roomDisplayNickname,
					profilePictureUrl : state.roomInfo.owner.profilePictureUrl
				}
				userIds[state.roomInfo.owner.id_str] = {
					userId : state.roomInfo.owner.id_str,
					uniqueId : roomDisplayId,
					nickname : roomDisplayNickname,
					profilePictureUrl : state.roomInfo.owner.profilePictureUrl
				}
			}

		}).catch(errorMessage => {
			$('#stateText').text(errorMessage);

			// schedule next try if obs username set
			if (window.settings.username) {
				setTimeout(() => {
					connect(window.settings.username);
				}, 30000);
			}
		})
	} else {
		alert('no username entered');
	}
}

// Prevent Cross site scripting (XSS)
function sanitize(text) {
	return text ? text.replace(/</g, '&lt;') : ''
}

function updateRoomStats() {
	$('#viewerCountStats').val(parseInt(viewerCount).toLocaleString('en'));
	$('#likeCountStats').val(parseInt(likeCount).toLocaleString('en'));
	$('#diamondsCountStats').val(parseInt(diamondsCount).toLocaleString('en'));
}

function generateUsernameLink(data) {
	return `<a href="https://tiktok.com/@${data.uniqueId}" title="${data.nickname}" target="_blank" class="usernamelink">${data.nickname}</a>`; /*<button type="button" class="usernamelink btn btn-link" title="${data.nickname}" data-bs-toggle="popover" onclick="openPop()" data-bs-title="${data.nickname}">${data.uniqueId}</button>`; */
}

function isPendingStreak(data) {
	return data.giftType === 1 && !data.repeatEnd;
}

/**
 * Add a new message to the chat container
 */
function insertEmotes(comment, subEmotes) {
	// Sort emotes by placeInComment, in descending order
	subEmotes.sort((a, b) => (b.placeInComment || 0) - (a.placeInComment || 0));

	// Loop through the emotes and splice them into the comment
	subEmotes.forEach(emoteObj => {
		const position = emoteObj.placeInComment || 0;
		const emoteImageTag = `<img src="${emoteObj.emoteImageUrl}" alt="emote" class="img-fluid chat-img-emote">`;
		// Insert the image tag at the specified position
		comment = comment.slice(0, position) + emoteImageTag + comment.slice(position);
	});
	return comment;
}

const utterance = new SpeechSynthesisUtterance()
let currentCharacter
utterance.addEventListener('boundary', e => {
	currentCharacter = e.charIndex
})

function playText(text) {
	if (speechSynthesis.paused && speechSynthesis.speaking) {
		return speechSynthesis.resume()
	}
	if (speechSynthesis.speaking) return
	utterance.text = text
	utterance.rate = 1 //speedInput.value || 1
	//textInput.disabled = true
	speechSynthesis.speak(utterance)
}
function addChatItem(color, data, text, cont) {
	let container = location.href.includes('obs.html') ? $('.eventcontainer') : $(cont);
	//🚔 👮
	let nickname, badgeLength = data.userBadges.length, afterName = '', b4Name = '';
	if(badgeLength > 0){
		for(let i = 0;i<badgeLength;i++){
			if(data.userBadges[i].type == 'image'){
				afterName += '<img src="'+data.userBadges[i].url+'" class="img-fluid chat-img-badge">';
			} else if(data.userBadges[i].name == 'Moderator'){
				afterName += '👮';
			} else if(data.userBadges[i].badgeSceneType == 8){
				// gifter level
				b4Name += '<span class="gifter-level gifter-level-'+data.userBadges[i].level+'">💎 '+data.userBadges[i].level+'</span>'
			} else if(data.userBadges[i].badgeSceneType == 10){
				// team level
				b4Name += '<span class="team-level team-level-'+data.userBadges[i].level+'">💗 '+data.userBadges[i].level+'</span>'
			} else {

			}
		}
	}
	nickname = data.nickname.replace("'", "\\'")
	let isFoll = '', followInfo
	if(data && typeof data === 'object' && data.followInfo){
		isFoll = data.followInfo.followStatus == 2 ? 'Friends w/ Host'
		: data.followInfo.followStatus == 1 ? 'Following Host' : 'Not Following Host';
		followInfo = `<div class="input-group my-3">
			<span class="input-group-text w-50 text-center">${data.followInfo.followerCount} Followers</span>
			<span class="input-group-text w-50 text-center">${data.followInfo.followingCount} Following</span>
		</div>`;
	}
	container.prepend(`
	<li class="list-group-item list-group-item-action px-1 pt-2 pb-1" title="${data.nickname}" data-bs-title="${data.nickname}" data-bs-toggle="popover" data-bs-content='<div class="row">
		<div class="col-4"><img class="w-100 h-auto rounded-circle" src="${data.profilePictureUrl}"></div>
			<div class="col-8">
				<h3 style="white-space:pre;">${data.nickname.replaceAll("'", "&apos;")}</h3><h5 style="white-space:pre;">@${data.uniqueId}</h5>
				<div class="bg-dark-subtle p-3 text-emphasis-dark border border-light-subtle">
					${isFoll}
				</div>
			</div>
		</div>
		<div class="d-grid gap-2 col-12 mx-auto">
			${followInfo}
			<a href="https://tiktok.com/@${data.uniqueId}" title="${data.nickname.replaceAll("'", "&apos;")}"   target="_blank" class="btn btn-primary">View TikTok</a>
		</div>'>
		<div class="row g-1 d-table">
			<div class="col-2 col-sm-1 d-table-cell align-top">
				<img class="w-100 h-auto rounded-circle" src="${data.profilePictureUrl}">
			</div>
			<div class="col-10 col-sm-11 d-table-cell align-middle">
				<span>
					<b>${b4Name}${generateUsernameLink(data)}${afterName}:</b>
					<span style="color:${color}">${text}</span>
				</span>
			</div>
		</div>
	</li>`);
	//	 <p>${data.userDetails.bioDescription.replaceAll("'", "&apos;")}</p>
	if(voiceComments == 1){
		playText(text)
	}
	container.find('li[data-bs-toggle="popover"]:first').popover({
		sanitize: false,
		html: true,
		customClass: 'user-pop',
		//trigger: 'click',
		//delay: {"show": 200, "hide": 500}
	}).on('show.bs.popover', () => {
		$('li[data-bs-toggle="popover"]').not($(this)).popover('hide');
		setTimeout(function(){
			$('li[data-bs-toggle="popover"]').popover('hide');
		},10000)
	})
	container.find('[data-bs-toggle="tooltip"]:first').tooltip()
	//new bootstrap.Tooltip(this)
	//container.stop();
	//container.animate({
	//	scrollTop: container[0].scrollHeight
	//}, 400);
	if(data.uniqueId in usernames){} else {
		//let tempuname = {};
		usernames[data.uniqueId] = {
			userId : data.userId,
			uniqueId : data.uniqueId,
			nickname : data.nickname,
			profilePictureUrl : data.profilePictureUrl
		}
		userIds[data.userId] = {
			userId : data.userId,
			uniqueId : data.uniqueId,
			nickname : data.nickname,
			profilePictureUrl : data.profilePictureUrl
		}
	}
}

function addShareItem(color, data, text, cont) {
	let container = $('.sharecontainer'), sans = sanitize(text);
	container.prepend(`<li class="list-group-item p-1">
		<div class="static">
			<img class="miniprofilepicture" src="${data.profilePictureUrl}">
			<span>
				<b>${generateUsernameLink(data)}:</b>
				<span style="color:${color}">${sans}</span>
			</span>
		</div>
	</li>`);
	if(data.uniqueId in usernames){} else {
		//let tempuname = {};
		usernames[data.uniqueId] = {
			userId : data.userId,
			uniqueId : data.uniqueId,
			nickname : data.nickname,
			profilePictureUrl : data.profilePictureUrl
		}
		userIds[data.userId] = {
			userId : data.userId,
			uniqueId : data.uniqueId,
			nickname : data.nickname,
			profilePictureUrl : data.profilePictureUrl
		}
	}
	sendToDb('share', 'shared', {
		timestamp: data.timestamp,
		sharer: userIds[data.userId],
		count: sans
	})
}
/**
 * Add a new gift to the gift container
 */
function addGiftItem(data) {
	let container = location.href.includes('obs.html') ? $('.eventcontainer') : $('.giftcontainer');
	if(data.uniqueId in usernames){} else {
		//let tempuname = {};
		usernames[data.uniqueId] = {
			userId : data.userId,
			uniqueId : data.uniqueId,
			nickname : data.nickname,
			profilePictureUrl : data.profilePictureUrl
		}
		userIds[data.userId] = {
			userId : data.userId,
			uniqueId : data.uniqueId,
			nickname : data.nickname,
			profilePictureUrl : data.profilePictureUrl
		}
	}
	let streakId = data.uniqueId.toString() + '_' + data.giftId;
	let isPending = isPendingStreak(data)
	let diamonds = data.diamondCount * data.repeatCount
	let diamondsLocal = parseInt(data.diamondCount * data.repeatCount).toLocaleString()

	/*test */
	let giftFor = '', tapName = '';
	if(data.receiverUserId in userIds){
		giftFor = 'to '+generateUsernameLink(userIds[data.receiverUserId]);
	}

	let badgeLength = data.userBadges.length
	let afterName = '';
	let b4Name = '';
	if(badgeLength > 0){
		for(let i = 0;i<badgeLength;i++){
			if(data.userBadges[i].type == 'image'){
				afterName += '<img src="'+data.userBadges[i].url+'" class="img-fluid chat-img-badge">';
			} else if(data.userBadges[i].name == 'Moderator'){
				afterName += '👮';
			} else if(data.userBadges[i].badgeSceneType == 8){
				// gifter level
				b4Name += '<span class="gifter-level gifter-level-'+data.userBadges[i].level+'">💎 '+data.userBadges[i].level+'</span>'
			} else if(data.userBadges[i].badgeSceneType == 10){
				// team level
				b4Name += '<span class="team-level team-level-'+data.userBadges[i].level+'">💗 '+data.userBadges[i].level+'</span>'
			} else {

			}
		}
	}

	let html = `<li class="list-group-item list-group-item-action p-1" data-streakid="${isPendingStreak(data) ? streakId : ''}">
	<div class="row g-2">
		<div class="col-1">
			<img class="w-100 h-auto rounded" src="${data.profilePictureUrl}">
		</div>
		<div class="col-11">
			<p class="fw-bold mb-1">${b4Name} ${generateUsernameLink(data)} ${afterName}:</b> <span>${data.describe} ${giftFor}</span></p>
			<div class="row g-1">
				<div class="col-2">
					<img class="w-100 h-auto rounded-circle" src="${data.giftPictureUrl}">
				</div>
				<div class="col-10">
					<span>Name: <b>${data.giftName}</b> (ID:${data.giftId})<span><br>
					<span>Repeat: <b style="${isPending ? 'color:red' : ''}">x${data.repeatCount.toLocaleString()}</b><span><br>
					<span>Cost: <b>${diamondsLocal} Diamonds</b><span>
				</div>
			</div>
		</div>
	</div>
	</li>`;


	let existingStreakItem = container.find(`[data-streakid='${streakId}']`);

	if (existingStreakItem.length) {
		existingStreakItem.replaceWith(html);
	} else {
		container.prepend(html);
	}


	if(!isPending){
		let gifter = data.uniqueId;
		if(gifter in gifter_ary){
			gifter_ary[gifter].coins = parseInt(gifter_ary[gifter].coins)+parseInt(diamonds);
			$('[data-gifter="'+gifter+'"]').remove()
		} else {
			gifter_ary[gifter] = {
				username: data.nickname,
				uniqueId: data.uniqueId,
				userId: data.userId,
				coins: diamonds,
				likes: 0,
				shares: 0
			}
		}
		let gifterTable = $('#gifter-table tbody')
		//let tline = gifter_ary[gifter].username+','+gifter_ary[gifter].uniqueId+','+gifter_ary[gifter].coins+"\n";
		gifterTable.prepend(`
			<tr data-gifter="${gifter}">
				<td class="col-5 text-break">${gifter_ary[gifter].username}</td>
				<td class="col-5 text-break">${gifter_ary[gifter].uniqueId}</td>
				<td class="col-2 text-break">${parseInt(gifter_ary[gifter].coins).toLocaleString('en')}</td>
				<td class="d-none save">${gifter_ary[gifter].userId}</td>
				<td class="d-none">${gifter_ary[gifter].likes}</td>
			</tr>
		`)

		if(saveGifts == 1){
			socket.emit('addGift', {
				giftId: data.giftId,
				userId: data.userId,
				giftName: data.giftName,
				uniqueId: data.uniqueId,
				nickname: data.nickname,
				timestamp: data.timestamp,
				repeatCount: data.repeatCount,
				receiverUser: data.receiverUserId in userIds ? userIds[data.receiverUserId].nickname : '',
				receiverUserId: data.receiverUserId,
				diamondCount: diamondsLocal,
				giftPictureUrl: data.giftPictureUrl,
				profilePictureUrl: data.profilePictureUrl,
			});
		}

		let sPath = Config["sounds"]["gift"][data["giftName"].toLowerCase()] || Config["sounds"]["gift"]["default"]
		if(playSounds == 1 && Config["enabled"]["gift"] && sPath){
			console.log('play sound?')
			let announcement = new Announcement(
				sPath
			);
			announcement.sound();
		}
	}
}

function addLikeItem(color, data, text, summarize) {
	let container = $('.likecontainer');
	//let tt = sanitize(text);
	//console.log(tt);
	if (container.find('div').length > 500) {
		container.find('div').slice(0, 200).remove();
	}
	//container.find('.temporary').remove();
	if(text != ''){
		container.prepend(`<li class="list-group-item list-group-item-action p-1">
			<div class=${summarize ? 'temporary' : 'static'}>
				<img class="miniprofilepicture" src="${data.profilePictureUrl}">
				<span>
					<b>${generateUsernameLink(data)}:</b>
					<span style="color:${color}">${sanitize(text)}</span>
				</span>
			</div>
		</li>`);
	}
}

function updateTopGifters(viewers){
	let container = $('#topViewers')
	container.html('Loading Gifters...')
	if(viewers.length > 0){
		let cc = 0, i, top = '', rest = '', drop = `<li class="nav-item dropdown">
			<a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false"></a>
			<ul class="dropdown-menu" style="width:250px;">
		`, drop_end = `</ul></li>`
		for(i=0;i<viewers.length;i++){
			if("nickname" in viewers[i].user){
				if(i < 2){
					top += `<li class="nav-item">
						<a class="nav-link" aria-current="page" href="https://tiktok.com/@${viewers[i].user.uniqueId}" target="_blank">
							<img style="width:45px; max-width:45px;" class="h-auto rounded-circle" src="${viewers[i].user.profilePictureUrl}">
							${viewers[i].user.uniqueId}
							<small>(${viewers[i].coinCount} coins)</small>
						</a>
					</li>`
				}
				drop += `<li class="nav-item border-bottom">
					<a class="nav-link" aria-current="page" href="https://tiktok.com/@${viewers[i].user.uniqueId}" target="_blank">
						<img style="width:45px; max-width:45px;" class="h-auto rounded-circle" src="${viewers[i].user.profilePictureUrl}">
						${viewers[i].user.uniqueId}
						<small>(${viewers[i].coinCount} coins)</small>
					</a>
				</li>`

				if(parseInt(viewers[i].coinCount) > 0
					&& typeof viewers[i].user.username != undefined
					&& viewers[i].user.username != 'undefined'
					&& viewers[i].user.username != ''
					&& viewers[i].user.username != null){
					let gifter = viewers[i].user.uniqueId;

					if(msg.uniqueId in usernames){} else {
						//let tempuname = {};
						usernames[viewers[i].user.uniqueId] = {
							userId : viewers[i].user.userId,
							uniqueId : viewers[i].user.uniqueId,
							nickname : viewers[i].user.nickname,
							profilePictureUrl : viewers[i].user.profilePictureUrl
						}
						userIds[viewers[i].user.userId] = {
							userId : viewers[i].user.userId,
							uniqueId : viewers[i].user.uniqueId,
							nickname : viewers[i].user.nickname,
							profilePictureUrl : viewers[i].user.profilePictureUrl
						}
					}

					if(gifter in gifter_ary){
						gifter_ary[gifter].coins = parseInt(viewers[i].coinCount);
						$('[data-gifter="'+gifter+'"]').remove()
					} else {
						gifter_ary[gifter] = {
							username: viewers[i].user.nickname,
							uniqueId: viewers[i].user.uniqueId,
							userId: viewers[i].user.userId,
							coins: parseInt(viewers[i].coinCount),
							likes: 0,
							shares: 0
						}

					}
					let gifterTable = $('#gifter-table tbody')
					//let tline = gifter_ary[gifter].username+','+gifter_ary[gifter].uniqueId+','+gifter_ary[gifter].coins+"\n";
					gifterTable.prepend(`
						<tr data-gifter="${gifter}">
							<td>${gifter_ary[gifter].username}</td>
							<td>${gifter_ary[gifter].uniqueId}</td>
							<td>${gifter_ary[gifter].coins}</td>
							<td class="d-none save">${gifter_ary[gifter].userId}</td>
							<td class="d-none">${gifter_ary[gifter].likes}</td>
						</tr>
					`)
				}
			}
		}
		container.html('<ul class="nav nav-pills">'+top+drop+drop_end+'</ul>');
		//console.log(top)

	} else {
		container.html('no viewers..?')
		//console.log('no viewers')
	}
}

let Config = {
	buildNames(json){
		let datalist = document.getElementById('datalistOptions');
		datalist.innerHTML = ''
		//let nameList = document.getElementById('name-list');
		let html = '', gsound = '', notes = ''
		for(const item of json['names']){
			datalist.appendChild(new Option(item,item));
			html += `<li data-list-name="${item}"
				class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
				${item}
				<span class="c-pointer" data-name="${item}" onclick="removeName(this)">
					<svg fill="#842029" xmlns="http://www.w3.org/2000/svg"
						width="24" height="24" viewBox="0 0 24 24">
						<use href="#svg-trash"></use>
					</svg>
				</span>
			</li>`
		}
		$('#name-list').html(html)
	},
	buildNotes(json){
		let notes = ''
		//for(const note in json['notes']){
		//	console.log(note)
		//	notes += `<button type="button" class="m-2 btn btn-outline-secondary"
		//		onclick="loadNote('${note}')">${note}</a>`
		//		// , '${no1.replace("\n", "<br>").replace("'", "\'")}'
		//}
		for(const note in json['notes']){
			console.log(note)
			notes += `<button type="button" class="m-2 btn btn-outline-secondary"
				onclick="loadNote('${json['notes'][note].name}')">${json['notes'][note].name}</a>`
		}
		$('#note-list').html(notes)
	},
	buildSounds(json){
		let gsound = '' //, i, count = json['sounds']['gift'].length
		for(const sou in json['sounds']['gift']){
			//<span>${json['sounds']['gift'][sou].removeLast(4)}</span>
			//for(i=0;i < count; i++){
			let filename = json['sounds']['gift'][sou]
			let file = String(filename).removeLast(4).replace('/sounds/', '')
			gsound += `<li data-list-name="${sou}"
			class="list-group-item list-group-item-action d-flex">
			<span class="flex-grow-1">${sou}</span>
			<span>${file}</span>
			<span class="ms-3 c-pointer"
				data-url="${json['sounds']['gift'][sou]}"
				onclick="playSound(this)">
				<svg fill="#0d6efd" class="s-on d-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 7l8-5v20l-8-5v-10zm-6 10h4v-10h-4v10zm20.264-13.264l-1.497 1.497c1.847 1.783 2.983 4.157 2.983 6.767 0 2.61-1.135 4.984-2.983 6.766l1.498 1.498c2.305-2.153 3.735-5.055 3.735-8.264s-1.43-6.11-3.736-8.264zm-.489 8.264c0-2.084-.915-3.967-2.384-5.391l-1.503 1.503c1.011 1.049 1.637 2.401 1.637 3.888 0 1.488-.623 2.841-1.634 3.891l1.503 1.503c1.468-1.424 2.381-3.309 2.381-5.394z"/></svg>
				<svg fill="#6c757d" class="s-off" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 7.358v15.642l-8-5v-.785l8-9.857zm3-6.094l-1.548-1.264-3.446 4.247-6.006 3.753v3.646l-2 2.464v-6.11h-4v10h.843l-3.843 4.736 1.548 1.264 18.452-22.736z"/></svg>
			</span>
			<span class="ms-3 c-pointer"
				data-name="${sou}" onclick="removeGift(this)">
				<svg fill="#842029" xmlns="http://www.w3.org/2000/svg"
					width="24" height="24" viewBox="0 0 24 24">
						<use href="#svg-trash"></use>
					</svg>
			</span>
			</li>`
		}
		$('#gift-list').html(gsound)
	},

	buildUnusedGifts(json){
		let giftDrop = '' //, i, count = json['sounds']['gift'].length
		for(const gift in json['sounds']['unused']){
			giftDrop += '<option value="'+gift+'">'+gift+'</option>'
		}
		$('#group-gift').html(giftDrop)
	},
	grabConfig(ups){
		fetch("/config.json").then((response) => response.json()).then((json) => {
			Config = Object.assign({}, Config, json);
			if(ups == 'all'){
				Config.buildNames(json)
				Config.buildNotes(json)
				Config.buildSounds(json)
				Config.buildUnusedGifts(json)
			} else if(ups == 'names'){
				Config.buildNames(json)
			} else if(ups == 'notes'){
				Config.buildNotes(json)
			} else if(ups == 'sounds'){
				Config.buildSounds(json)
			}
		});
	},

	updateConfig() {
		Config.grabConfig('all')
		//fetch("/config.json").then((response) => response.json()).then((json) => {
		//	Config = Object.assign({}, Config, json);
		//	Config.buildNames(json)
		//	Config.buildNotes(json)
		//	Config.buildSounds(json)
		//});
	}
}

Config.updateConfig();

class Announcement {
	#soundUrl;
	constructor(soundUrl) {
		this.#soundUrl = soundUrl;
	}
	sound() {
		if (!this.#soundUrl) {
			return;
		}
		let audio = new Audio(this.#soundUrl)
		audio.volume = Config["volume"];
		audio.play().catch();
	}

}

function removeName(th){
	let th2 = $(th), name = th2.data('name')
	socket.emit('removeNames', {
		name : name
	})
}

const userCog = $('#userCog')
$(document).ready(() => {
	$('#delete-note').on('click', ()=>{
		let name = $('#note-id').val()
		console.log(name)
		socket.emit('deleteNote', {
			name: name
		})
	})
	$('#save-gift-sound').on('click', () => {
		let gift = $('#group-gift').val(), sound = $('#group-sound').val()
		socket.emit('saveGiftSound', {
			gift: gift,
			sound: '/sounds/'+sound
		})
	})
	$('#play-gift-sound').on('click', () => {
		let sfile = $('#group-sound').val()
		let announcement = new Announcement(
			'/sounds/'+sfile
		);
		announcement.sound();
	})
	$('#new-note').on('click', function(){
		$('#note-id').val('new')
		$('#delete-note').slideUp('fast')
		$('#new-note-name').val('')
		$('#new-note-info').val('')
		$('#new-note-form').collapse('show')
	})
	$('#save-note').on('click', function(){
		let id = $('#note-id').val(),
		name = $('#new-note-name'),
		info = $('#new-note-info'),
		error = false,
		box = ''
		if(name.val() == ''){
			error = true
			name.addClass('is-invalid')
		} else {
			name.removeClass('is-invalid')
		}
		if(name.val() == 'new'){
			error = true
			name.addClass('is-invalid')
		}
		if(info.val() == ''){
			error = true
			info.addClass('is-invalid')
		} else {
			info.removeClass('is-invalid')
		}
		if(error == false){
			let na2 = name.val().replace("'", "\'").replace('"', '\"')
				, no2 = info.val()
			socket.emit('saveNote', {
				id: id,
				name: na2,
				note: no2
			})
			if(id == 'new'){
				$('#note-list').html(`<button type="button" class="m-2 btn btn-outline-secondary"'
					+'onclick="loadNote('${na2}')">${na2}</button>
					${$('#note-list').html()}`
				// , \''+no2.replace("<br>", "\n")+'\'
				)
			} else {
				//$(`#note-list button[onclick="loadNote('${na2}')]`)
			}
			$('#new-note-form').collapse('hide')
			$('#note-id').val('new')
			$('#new-note-name').val('')
			$('#new-note-info').val('')
			Config.updateConfig();
			//if(Array.isArray(json['notes'][note])){
			//	box = json['notes'][note][0].replace("'", "\'")
			//} else {
			//	box = json['notes'][note].replace("'", "\'")
			//}
		}
	})
	$('#add-username').on('click', function(){
		let name = $('#new-username'), uname = name.val()
		if(uname == ''){
			// make error
			name.addClass('is-invalid')
		} else {
			if(Config.names.includes(uname)){

			} else {
				name.removeClass('is-invalid')
				socket.emit('addToNames', {
					name : uname
				})
			}
		}
	})
	$('#vc-on').on('click', function(){
		voiceComments = 2
		$('#vc-on').addClass('d-none')
		$('#vc-off').removeClass('d-none')
	})
	$('#vc-off').on('click', function(){
		voiceComments = 1
		$('#vc-off').addClass('d-none')
		$('#vc-on').removeClass('d-none')
	})
	$('#s-on').on('click', function(){
		playSounds = 2
		$('#s-on').addClass('d-none')
		$('#s-off').removeClass('d-none')
	})
	$('#s-off').on('click', function(){
		playSounds = 1
		$('#s-off').addClass('d-none')
		$('#s-on').removeClass('d-none')
	})
	$('#g-on').on('click', function(){
		saveGifts = 2
		$('#g-on').addClass('d-none')
		$('#g-off').removeClass('d-none')
	})
	$('#g-off').on('click', function(){
		saveGifts = 1
		$('#g-off').addClass('d-none')
		$('#g-on').removeClass('d-none')
	})
	$('#ch').on('click', function(){

		socket.emit('addToNames', {
			name : 'another name'
		})
		console.log('playSounds = '+playSounds)
		console.log('saveGifts = '+saveGifts)
		console.log('------------')
	})
	$('#userSignUpLink').on('click', function(){
		bootstrap.showAlert({title: "Sign Up Closed", body: "During testing phases, our sign up process will be closed. If you would like to test some new features, please contact Yohn."})
	})

	$('#userLogin').on('click', function(){
		userCog.find('.switch-toggle').toggleClass('d-none')
		socket.emit('userLogin', {
			email : $('#userEmail').val(),
			pass : $('#userPassword').val()
		})
	})

	$('#copy-table').on('click', function(){
		//console.log('copy btn clicked')
		let gt = $('#gifter-table')
		gt.find('save').removeClass('d-none')
		let text = gt.html(), textarea = document.getElementById('hidden')
		textarea.value = text; //.split("	").join(',');

		//console.log('copy')
		textarea.select();
		textarea.setSelectionRange(0, textarea.value.length)
		navigator.clipboard.writeText(textarea.value);
		textarea.setSelectionRange(0,0)
	})
	$('#connectButton').click(connect);
	$('#uniqueIdInput').on('keyup', function (e) {
		if (e.key === 'Enter') {
			connect();
		}
	});

	if (window.settings.username) connect();
	let pops = {
			sanitize: false,
			html: true,
			trigger: 'focus'
		};
	let chatcont = $('#chatcontainer')
	$('#add-row').on('click', function(){
		let row = $('#the-row').html()
		chatcont.prepend(row)
		chatcont.find('li[data-bs-toggle="popover"]:first').popover(pops)
	})
	$('[data-bs-toggle="popover"]').popover(pops);
})


//socket.on('readUsernames', (data) => {
//	console.log(data)
//})

socket.on('toDoData', (data) => {
	console.log(data)
})
socket.on('removeGiftSound', (data) => {
	console.log(data)
})
socket.on('saveGiftSound', (data) => {
	console.log(data)
})
socket.on('deleteNote', (data) => {
	$('#note-results').html(`<div class="alert alert-secondary mt-3" role="alert">
		${data.r}
	</div>`).collapse('show')
	$('#note-id').val('new')
	$('#new-note-name').val('')
	$('#new-note-info').val('')
	$('#new-note-form').collapse('hide')
	$('#delete-note').slideUp('fast')
	setTimeout(function(){
		$('#note-results').collapse('hide')
		//Config.updateConfig();
		Config.grabConfig('notes')
	}, 2000)
})
socket.on('saveNote', (data) => {
	$('#note-results').html(`<div class="alert alert-secondary mt-3" role="alert">
		${data.r}
	</div>`).collapse('show')
	setTimeout(function(){
		$('#note-results').collapse('hide')
		//Config.updateConfig();
		Config.grabConfig('notes')
	}, 5000)
})
socket.on('addToNames', (data) => {
	console.log('-----addToNames return-----')
	console.log(data)
	$('#name-list').prepend(`<li data-list-name="${data.name}"
		class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
		${data.name}
		<span class="badge text-bg-primary rounded-pill c-pointer"
		data-name="${data.name}" onclick="removeName(this)">🗑️</span>
	</li>`)
	console.log('-----addToNames return-----')
})
socket.on('removeNames', (data) => {
	console.log('-----removeNames return-----')
	console.log(data)
	console.log('-----removeNames return-----')
	$('li[data-list-name="'+data.name+'"]').slideUp('fast', function(){$(this).remove();})
})
socket.on('soundDirectory', (data) => {
	for(const sound in data.files){
		$('#group-sound').append(`<option value="${data.files[sound]}">${data.files[sound].removeLast(4)}</option>`)
	}
})
socket.on('loginTry', (data) => {
	userCog.find('.switch-toggle').toggleClass('d-none')
	if(data.r == 'ok'){
		console.log('logged in successful')
		console.log(data)
		console.log('/login in data')
		let list = JSON.parse(data.info.userList)
			, userListLen = list.length, u, usersHtml = '', userTags = '';
		if(userListLen > 0){
			for(u=0;u<userListLen;u++){
				usersHtml += '<option value="'+list[u]+'"></option>';
			}
			$('#datalistOptions').html(usersHtml);
		}
		$('#settingLoginLi').html(`<li>
			<a class="dropdown-item" href="#" id="moAutofillHost">Autofill Hosts</a>
		</li>
		<li>
			<a class="dropdown-item" href="#" id="moNotes">Notes Hosts</a>
		</li>`)//addClass('d-none').after(data.replaceForm)
		//$('#settingLoginLi')
		//	created: "12/21/2023 4:24:59"
		//	email: "yohns@live.com"
		//	keyFile: "Some key file"
		//	lastLogin: ""
		//	name: "Yohn"
		//	premiumUntil: ""
		//	sheetId: "",
		//	sounds: '{"rose":"rose"}',
		//	userList: '{"yohn.john", "dancehallwifi", "aviannaav", "imanalyn31"}'*/
		console.log(data)
	} else {
		console.log('could not login - 1')
	}
})

// viewer stats
connection.on('roomUser', (msg) => {
	//console.log('-- roomUser --')
	//console.log(msg)
	//console.log('-- roomUser --')
	if (typeof msg.viewerCount === 'number') {
		viewerCount = msg.viewerCount;
		updateRoomStats();
		updateTopGifters(msg.topViewers);
	}
})

// like stats
connection.on('like', (msg) => {
	//console.log('-- likes --')
	//console.log(msg)
	//console.log('-- /likes --')
	if (typeof msg.totalLikeCount === 'number') {
		likeCount = msg.totalLikeCount;
		updateRoomStats();
	}

	if (window.settings.showLikes === "0") return;

	if (typeof msg.likeCount === 'number') {
		var uname = msg.uniqueId;
		if(uname in link_ary){
			link_ary[uname] = link_ary[uname]+1
		} else {
			link_ary[uname] = 1
		}

		let tlike = $('#likestotalcontainer,#alltotalcontainer')
		$(`[data-uname="${msg.uniqueId}"]`).remove()
		let thename = generateUsernameLink(msg)
		tlike.prepend(`
		<li data-uname="${msg.uniqueId}" class="list-group-item list-group-item-action px-1 pt-2 pb-1">
			<div class="row g-1 d-table">
				<div class="col-2 col-sm-1 d-table-cell align-top">
					<img class="w-100 h-auto rounded-circle" src="${msg.profilePictureUrl}">
				</div>
				<div class="col-10 col-sm-11 d-table-cell align-middle">
					<span>
						<b>${thename}:</b>
						<span style="color:#447dd4"> sent ${link_ary[uname]} likes</span>
					</span>
				</div>
			</div>
		</li>`)
		if(msg.uniqueId in usernames){} else {
			//let tempuname = {};
			usernames[msg.uniqueId] = {
				userId : msg.userId,
				uniqueId : msg.uniqueId,
				nickname : msg.nickname,
				profilePictureUrl : msg.profilePictureUrl
			}
			userIds[msg.userId] = {
				userId : msg.userId,
				uniqueId : msg.uniqueId,
				nickname : msg.nickname,
				profilePictureUrl : msg.profilePictureUrl
			}
		}
	}
})

// Member join
let joinMsgDelay = 0;
connection.on('member', (msg) => {
	//console.log('-- member --')
	//console.log(msg)
	//console.log('-- member --')
	if (window.settings.showJoins === "0") return;

	let addDelay = 250;
	if (joinMsgDelay > 500) addDelay = 100;
	if (joinMsgDelay > 1000) addDelay = 0;

	joinMsgDelay += addDelay;

	setTimeout(() => {
		joinMsgDelay -= addDelay;
		addChatItem('#21b2c2', msg, msg.label.replace('{0:user}', ''), '#joinstotalcontainer,#alltotalcontainer'); //.joincontainer');
	}, joinMsgDelay);
	//
	sendToDb('member', 'join', {
		userId:	 msg.userId,
		uniqueId:   msg.uniqueId,
		nickname:   msg.nickname,
		timestamp:  msg.createTime,
		profilePictureUrl: msg.profilePictureUrl,
		displayType: msg.displayType
	})
	if(msg.uniqueId in usernames){} else {
		//let tempuname = {};
		usernames[msg.uniqueId] = {
			userId : msg.userId,
			uniqueId : msg.uniqueId,
			nickname : msg.nickname,
			profilePictureUrl : msg.profilePictureUrl
		}
		userIds[msg.userId] = {
			userId : msg.userId,
			uniqueId : msg.uniqueId,
			nickname : msg.nickname,
			profilePictureUrl : msg.profilePictureUrl
		}
	}
})

// New chat comment received
connection.on('chat', (msg) => {
	console.log('-- chat --')
	console.log(msg)
	console.log('-- chat --')
	if (window.settings.showChats === "0") return;

	//let msgcom = msg.hasOwnProperty('subemotes') ? insertEmotes(sanitize(msg.comment), msg.subemotes) : sanitize(msg.comment);
	let msgcom = insertEmotes(sanitize(msg.comment), msg.emotes);
	addChatItem('', msg, msgcom, '.chatcontainer');
})

// New gift received
connection.on('gift', (data) => {
  //if(data.giftName == 'Gift Box'){
	console.log('-- gift --')
	console.log(data)
	console.log('-- gift --')
  //}
	if (!isPendingStreak(data) && data.diamondCount > 0) {
		diamondsCount += (data.diamondCount * data.repeatCount);
		updateRoomStats();
	}

	if (window.settings.showGifts === "0") return;

	addGiftItem(data);
})
// share, follow
connection.on('social', (data) => {
	//console.log('-- social --')
	//console.log(data)
	//console.log('-- social --')
	if (window.settings.showFollows === "0") return;

	let color = data.displayType.includes('follow') ? '#ff005e' : '#2fb816';
	let conta = data.displayType.includes('follow') ? '#followstotalcontainer,#alltotalcontainer' : '#sharestotalcontainer,#alltotalcontainer';
	addChatItem(color, data, data.label.replace('{0:user}', ''), conta); //'.sharecontainer');

})

connection.on('questionNew', (data) => {
	console.log('--- questionNew')
	console.log(data)
	console.log('--- questionNew')
})
let battleStats = $('#battleParties')
connection.on('linkMicBattle', (data) => {
	console.log('---- linkMicBattle')
	console.log(data)
	console.log('---- linkMicBattle')
	let peopleSpan = 6
	if(data.battleUsers.length == 4){
		peopleSpan = 3
	}
	let i, str = '<div class="row">';
	for(i=0;i<data.battleUsers.length;i++){
		str += '<div class="col-'+peopleSpan+' text-center"><a href="https://www.tiktok.com/@'+data.battleUsers[i].uniqueId+'" target="_blank">'
		+data.battleUsers[i].nickname+'<br>'
		+'<img src="'+data.battleUsers[i].profilePictureUrl+'" class="rounded-circle" style="max-height:75px; width:auto;">'
		+'<br>@'+data.battleUsers[i].uniqueId+'</a><br>'
		+'<div id="battle-'+data.battleUsers[i].userId+'"></div></div>'
	}
	str += '</div>'
	//console.log(str)
	$('#battleParties').html(str)
	console.log('inserted battle stuff..')
})

connection.on('linkMicArmies', (data) => {
	console.log('linkMicArmies')
	console.log(data)
	console.log('/linkMicArmies')
	let i;
	//$('#battleStats').removeClass('d-none')
	for(i=0;i<data.battleArmies.length;i++){
		let i2, helpers = '', help_len = data.battleArmies[i].participants.length, giftersHere
		for(i2=0;i2<help_len;i2++){
			if(helpers != '') helpers += '<br>'
			helpers += data.battleArmies[i].participants[i2].nickname
		}
		giftersHere = helpers == '' ? '' : '<p class="fs-6 bg-body-tertiary p-2 m-0">'+helpers+'</p>'
		$('#battle-'+data.battleArmies[i].hostUserId).html('<big class="badge text-bg-primary">'+data.battleArmies[i].points+'</big>'+giftersHere)
		//$(helpers)('#battle-'+data.battleArmies[i].hostUserId)
	}
	//console.log('inserted info')
})
connection.on('liveIntro', (data) => {
	//console.log('liveIntro')
	//console.log(data)
	//console.log('/liveIntro')

	addChatItem('#ff00cc', data, data.description, '.chatcontainer');

	if(data.uniqueId in usernames){} else {
		usernames[data.uniqueId] = {
			userId : data.userId,
			uniqueId : data.uniqueId,
			nickname : data.nickname,
			profilePictureUrl : data.profilePictureUrl
		}
		userIds[data.userId] = {
			userId : data.userId,
			uniqueId : data.uniqueId,
			nickname : data.nickname,
			profilePictureUrl : data.profilePictureUrl
		}
	}
})

connection.on('envelope', (data) => {
	console.log('envelope')
	console.log(data)
	console.log('/envelope')
})
connection.on('subscribe', (data) => {
	console.log('subscribe')
	console.log(data)
	console.log('/subscribe')
})

connection.on('streamEnd', (actionId) => {
	let msg = 'Stream Ended';
	if (actionId === 3) {
		msg = 'Stream ended by user';
	}
	if (actionId === 4) {
		msg = 'Stream ended by platform moderator (ban)';
	}

	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours() + ":" + today.getMinutes(); // + ":" + today.getSeconds();
	var dateTime = date+' '+time;
	//document.getElementById('dt').innerHTML = dateTime
	$('#stateText').html(msg+'<br>Ended At: '+dateTime);

	// schedule next try if obs username set
	if (window.settings.username) {
		setTimeout(() => {
			connect(window.settings.username);
		}, 30000);
	}
})

window.addEventListener("beforeunload", function (e) {
	e.preventDefault();
	e.returnValue = ""
});