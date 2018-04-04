var in_array = function(stringToSearch, arrayToSearch) {
	for (s = 0; s < arrayToSearch.length; s++) {
		thisEntry = arrayToSearch[s].toString();
		if (thisEntry == stringToSearch) {
			return true;
		}
	}
	return false;
};
var gridAltItem_cnt = 0;
var parseDom = function(arg) { 
	var objE = document.createElement("div"); 
	objE.innerHTML = arg; 
	return objE.childNodes; 
};
$(function(){
	console.log('fuck ygcp run');
	var myDate = new Date();
	var MD31 = [1,3,5,7,8,10,12],start_time = {m:3,d:17},now_time = {m:myDate.getMonth()+1,d:myDate.getDate()};
	var store_data = [];
	var store_data_confirm = [];
	var valid_post_data = null;
	var post_data_list = [];
	var GenStrDate = function(data){
		return ('2018-' + data.m + '-' + data.d);
	};
	var GenInsertTr = function(str_date){
		if(gridAltItem_cnt%2 == 0){
			var ret = '<tr class="fuck_confirm_tr gridItem" data-date="' + str_date + '"><td>'+ str_date +'</td><td></td><td><input type="button" value="直接确认"></td></tr>';
		}
		else{
			var ret = '<tr class="fuck_confirm_tr gridAltItem" data-date="' + str_date + '"><td>'+ str_date +'</td><td></td><td><input type="button" value="直接确认"></td></tr>';
		}
		++gridAltItem_cnt;
		return ret;
	};
	var get_post_data = function(){
		var len = post_data_list.length, i = 0;
		while( i < len){
			if(valid_post_data){
				break;
			}
			$.get(post_data_list[i], function(data,textStatus, jqXHR){
				if(data.indexOf('请点击下面保存成绩') > 0){
					if(valid_post_data){
						return;
					}
					var v_dom = parseDom(data);
					var valid_post_data_ckbox_part = [];
					$(v_dom).find('[name="ckbox"]').each(function(i, e){
						valid_post_data_ckbox_part.push('ckbox='+e.value);
					});
					valid_post_data = {};
					valid_post_data.get_url = 'MyRecords.aspx/TodayRecords?TheDay=' + $(v_dom).find('#daytimes').val();
					valid_post_data.ckbox_part = valid_post_data_ckbox_part;
				}
			});
			++i;
		}
	}
	var GenButton = function(){
		var str_content = '';
		while(!judge_end(start_time, now_time)){
			var str_date = GenStrDate(start_time);
			//console.log(start_time.d);
			if( !in_array(str_date, store_data) && !in_array(str_date, store_data_confirm) ){
				str_content += GenInsertTr(str_date);
			}
			start_time = date_plus(start_time);
		}
		console.log('fuck@GenButton');
		$('.gridHeader').after(str_content );		
	};
	var get_confirm_data = function(){
		$.get('MyRecords.aspx/AlreadyConfirmSports', function(data){
			var v_dom = parseDom(data);
			var data_list = $(v_dom).find('.gridItem,.gridAltItem');
			console.log(data_list);
			data_list.each(function(i,ele){
				console.log(ele);
				console.log(ele.children[4].textContent.trim());
				store_data_confirm.push(ele.children[4].textContent.trim());
			});
			var page_list = $(v_dom).find('.paginator a:not(.next)');
			console.log('DEBUG@GET PAGE LIST');
			console.log(page_list);
			var page_length = page_list.length, page_index = 0;
			var handle_confirm_data = function(page_url){
				//
				$.get(page_url, function(data){
					var v_dom = parseDom(data);
					var data_list = $(v_dom).find('.gridItem,.gridAltItem');
					console.log(data_list);
					data_list.each(function(i,ele){
						console.log(ele);
						console.log(ele.children[4].textContent.trim());
						store_data_confirm.push(ele.children[4].textContent.trim());
					});
					page_index = page_index + 1;
					if(page_index < page_length){
						handle_confirm_data(page_list[page_index].href);
					}
					else{
						GenButton();
					}
				});
				//
			};
			if(page_index < page_length){
				handle_confirm_data(page_list[page_index].href);
			}
			else{
				GenButton();
			}
		});
		
		console.log("log@get_confirm_data");
		console.log(store_data_confirm);
	};
	get_confirm_data();
	var date_plus = function(pos){
		pos.d += 1;
		if(in_array(pos.m, MD31)){
			if(pos.d == 32){
				pos.d =  1;
				pos.m += 1;
			}
		}
		else{
			if(pos.d == 31){
				pos.d =  1;
				pos.m += 1;
			}
		}
		return pos;
	}
	function judge_end(pos, end){
		//pos = date_plus(pos);
		if(pos.m == end.m && pos.d == end.d){
			return true;
		}
		else{
			return false;
		}
	}

	var data_list = $('.tableGrid').find('.gridItem,.gridAltItem')
	data_list.each(function(i,e){
		store_data.push(e.children[0].children[0].textContent.trim());
		post_data_list.push(e.children[2].children[0].attributes.getNamedItem("href").nodeValue);
	});

	function PostVal(year,month,day){
		if( month < 10 ) month = '0' + month;
		if(day < 10) day = '0' + day;
		return 'daytimes='+ year +'-'+month+'-'+day+'&' + valid_post_data.ckbox_part.join('&');
	}
	$('.tableGrid').on('click.fuckIt','input', function(eventObject){
		if(valid_post_data){
			var parent = $(this).parent().parent();
			console.log(parent);
			var str_date = parent.data('date').split('-');
			var post_data = PostVal(str_date[0], str_date[1], str_date[2]);
			$.get(valid_post_data.get_url, function(data){
				console.log(post_data);
				$.post('MyRecords.aspx/ResultSave', post_data );
				parent.remove();
			});			
		}else{
			alert('没有有效的长跑数据');
		}
	});
	get_post_data();
});
