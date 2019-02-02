function hexstr(number) {
    var chars = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
    var low = number & 0xf;
    var high = (number >> 4) & 0xf;
    return "" + chars[high] + chars[low];
}

function getAllCss() {

	let css = "", //variable to hold all the css that we extract
		styletags = document.getElementsByTagName("style");

	var csslinks = []

	//loop over all the style tags
	for (let i = 0; i < styletags.length; i++) {
		css += styletags[i].innerHTML; //extract the css in the current style tag
	}

	css +=
		[].slice.call(document.styleSheets)
			.reduce(function (prev, styleSheet) {

				try {


					if (styleSheet.cssRules) {
						return prev +
							[].slice.call(styleSheet.cssRules)
								.reduce(function (prev, cssRule) {
									return prev + cssRule.cssText;
								}, '');
					} else {
						return prev;
					}

				} catch (e) {

					console.log("error in", styleSheet)
					if (undefined != styleSheet && undefined != styleSheet.href)
						csslinks.push(styleSheet.href)
					return prev
				}
			}, '');
	return { css, csslinks };


}

function strtounit(combined) {
	if(combined.indexOf('px') != -1) {
		return {
			'unit': 'px',
			'size': combined.substr(0, combined.length - 2)
		};
	} else if (combined.indexOf('%') != -1) {
		return {
			'unit': '%',
			'size': combined.substr(0, combined.length - 1)
		};
	} else if (combined.indexOf('vw') != -1) {
		return {
			'unit': 'vw',
			'size': combined.substr(0, combined.length - 2)
		}
	} else if (combined.indexOf('vh') != -1) {
		return {
			'unit': 'vh',
			'size': combined.substr(0, combined.length - 2)
		}
	}
}

function getDataUri(url, callback) {
    var image = new Image();

    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext('2d').drawImage(this, 0, 0);

        // Get raw image data
        callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

        // ... or get as Data URI
        callback(canvas.toDataURL('image/png'));
    };

    image.src = url;
}


function convertrgbtohex(rgb) {
	var rgbval = rgb.substr(4, rgb.length - 5);
	rgbval = rgbval.split(', ');
	r = parseInt(rgbval[0], 10);
	g = parseInt(rgbval[1], 10);
	b = parseInt(rgbval[2], 10);
	return "#" + hexstr(r) + hexstr(g) + hexstr(b);
}

function get_gradient_options(prefix ,gradient) {
	var type, color, color_b, start_pos, stop_pos, position, return_val, degree;
	if (gradient.indexOf('radial') != -1) {
		type = 'radial';
		var data = gradient.substr(16, gradient.length - 17);
		position = data.substr(3, data.indexOf(', ') - 3);
		data = data.substr(data.indexOf(', ') + 2);
		var start = data.substr(0, data.indexOf(') ') + 1);
		data = data.substr(data.indexOf(') ') + 2)
		color = start;
		
		start_pos = data.substr(0, data.indexOf(', '));

		data = data.substr(data.indexOf(', ') + 2);
		var stop = data.substr(0, data.indexOf(') ') + 1);
		data = data.substr(data.indexOf(') ') + 2)
		color_b = stop;
		stop_pos = data;
	} else {
		var data = gradient.substr(16, gradient.length - 17);
		if (data.indexOf(', ') <= 6) {
			degree = data.substr(0, data.indexOf(', '));
			data = data.substr(data.indexOf(', ') + 2);
		}
		
		var start = data.substr(0, data.indexOf(') ') + 1);
		data = data.substr(data.indexOf(') ') + 2)
		color = start;
		
		start_pos = data.substr(0, data.indexOf(', '));

		data = data.substr(data.indexOf(', ') + 2);
		var stop = data.substr(0, data.indexOf(') ') + 1);
		data = data.substr(data.indexOf(') ') + 2)
		color_b = stop;
		stop_pos = data;
	}
	return_val = {}
	if (type != null)
		return_val[prefix + 'type'] = type;
	return_val[prefix + 'color'] = color;
	return_val[prefix + 'color_stop'] = strtounit(start_pos);
	return_val[prefix + 'color_b'] = color_b;
	return_val[prefix + 'color_b_stop'] = strtounit(stop_pos);
	if (position != null && position != 'center center')
		return_val[prefix + 'position'] = position;
	if (degree != null && degree != '180')
		return_val[prefix + 'gradient_angle'] = strtounit(degree);
	return return_val;
}

function check_background(prefix, element) {
	var position_initial = {
		'0%' : ['top', 'left'],
		'50%' : ['center', 'center'],
		'100%': ['bottom', 'right']
	}
	var result = {}
	var background_color;
	background_color = element.css('background-color');
	if (background_color != null) {
		result[prefix + 'background'] = 'classic';
		result[prefix + 'color'] = convertrgbtohex(background_color);
	}
	var background_image = element.css('background-image');
	if (background_image.indexOf('gradient') != -1) {
		result[prefix + 'background'] = 'gradient';
		options = get_gradient_options(prefix, background_image);
		result = {...result, ...options};
	} else {
		result[prefix + 'background'] = 'classic';
		position = element.css('background-position');
		position = position.split(' ');
		attachment = element.css('background-attachment');
		repeat = element.css('background-repeat');
		size = element.css('background-size');
		result[prefix+'position'] = position_initial[position[0]][0] + ' ' + position_initial[position[1]][1];
		result[prefix+'attachment'] = attachment;
		result[prefix+'repeat'] = repeat;
		result[prefix+'size'] = size;
		var uri
		uri = background_image.substr(5, background_image.length - 7)
		result[prefix+'image'] = {
			'url': uri,
			'id': Math.floor((Math.random() * 100) + 1)
		};
	}
	if (element.css('mix-blend-mode') != 'normal') {
		result['overlay_blend_mode'] = element.css('mix-blend-mode');
	} 
	if (element.css('opacity') != 1) {
		result['overlay_blend_mode'] = {
			unit: 'px',
			size: element.css('opacity')
		};
	}
	return result;
}

function get_section_options(element) {
	var width, height, items, background, gap, shape_content, content_position, overlay_options, back_options;
	
	options = {'html_tag': element[0].tagName.toLowerCase()}
	var classlist = element.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('elementor-section-height') != -1) {
				temp = classlist[i];
				if (height == null || height == 'default')
					height = temp.replace('elementor-section-height-', '');
			} else if (classlist[i].indexOf('width') != -1) {
				temp = classlist[i];
				if (width == null || width == 'default')
					width = temp.replace('elementor-section-', '');
			} else if (classlist[i].indexOf('elementor-section-content-') != -1) {
				temp = classlist[i];
				if (content_position == null || content_position == 'default')
					content_position = temp.replace('elementor-section-content-', '');
			}
			
		}
	}
	if (height != null)
		options['height_inner'] = height;
	if (width != null)
		options['layout'] = width;
	if (content_position != null)
		options['content_position'] = content_position;
	for (var j = 0; j < element.children().length; j ++) {
		child = element.children().eq(j);
		cclasslist = child.attr('class');
		if (cclasslist != undefined && cclasslist != null) {
			cclasslist = cclasslist.split(' ');
			for (i = 0; i < cclasslist.length; i ++) {
				if (cclasslist[i].indexOf('elementor-column-gap') != -1) {
					temp = cclasslist[i];
					if (gap == null)
						gap = temp.replace('elementor-column-gap-', '');
				} else if (cclasslist[i].indexOf('elementor-background-overlay') != -1) {
					overlay_options = check_background('background_overlay_', child);
				}
			}
		}
	}
	if (gap != null) {
		options['gap'] = gap;
	}
	if (overlay_options != null)
		options = {...options, ...overlay_options};
	data_settings = element.attr('data-settings');
	result = {...options}
	if (data_settings != undefined && data_settings != null) {
		data_settings = JSON.parse(data_settings);
		if (data_settings['background_background'] != 'video') {
			back_options = check_background('background_', element);
			result = {...result, ...back_options}
		}
		result = {...result, ...data_settings};
	}
	return result;
}

function get_column_options(element) {
	var width, wrap, back_overlay;
	options = {'html_tag': element[0].tagName.toLowerCase()}
	var classlist = element.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('elementor-col-') != -1) {
				temp = classlist[i];
				if (width == null)
					width = temp.replace('elementor-col-', '');
			} 
		}
	}
	if (width != null)
		options['_column_size'] = width;
	data_settings = element.attr('data-settings');
	if (data_settings != undefined && data_settings != null) {
		data_settings = JSON.parse(data_settings);
		result = {...options, ...data_settings};
		back_options = check_background('background_', element);
		result = {...result, ...back_options}
	}
	else {
		result = {...options};
	}
	return result;
}


function get_heading_options(element) {
	var size;
	heading = $('.elementor-heading-title', element);
	options = {'html_tag': heading[0].tagName.toLowerCase()};
	var title = heading.text();
	options['title'] = title;
	var classlist = heading.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('elementor-size-') != -1) {
				temp = classlist[i];
				if (size == null)
				size = temp.replace('elementor-size-', '');
			} 
		}
	}
	if (size != null)
		options['size'] = size;
	data_settings = element.attr('data-settings');
	if (data_settings != undefined && data_settings != null) {
		data_settings = JSON.parse(data_settings);
		result = {...options, ...data_settings};
		back_options = check_background('background_', element);
		result = {...result, ...back_options}
	}
	else {
		result = {...options};
	}
	return result;
}

function get_text_editor_options(element) {
	var size;
	editor_div = $('.elementor-text-editor', element);
	var editor = editor_div.html();
	options = {'editor': editor};
	data_settings = element.attr('data-settings');
	if (data_settings != undefined && data_settings != null) {
		data_settings = JSON.parse(data_settings);
		result = {...options, ...data_settings};
		back_options = check_background('background_', element);
		result = {...result, ...back_options}
	}
	else {
		result = {...options};
	}
	return result;
}

function get_image_options(element) {
	var size, caption, link;
	image_content = element;
	options = {};
	caption = $('figure', image_content);
	if (caption != null) {
		options['caption'] = $('figcaption', caption).text();
		options['caption_source'] = "custom";
	}
	link = $('a', image_content);
	link_options = {};
	if (link != null) {
		if(link.attr('data-elementor-open-lightbox') != undefined) {
			options['link_to'] = 'file';
			options['open_lightbox'] = link.attr('data-elementor-open-lightbox');
		} else {
			options['link_to'] = 'custom';
			link_options['url'] = link.attr('href');
			link_options['id'] = Math.floor((Math.random() * 100) + 1)
			if (link.attr('target') == '_blank') {
				link_options['is_external'] = 'on';
			} else {
				link_options['is_external'] = '';
			}
			if (link.attr('rel') == 'nofollow') {
				link_options['nofollow'] = 'on';
			} else {
				link_options['nofollow'] = '';
			}
			options['link'] = link_options;
		}
		
	}

	image = $('img', image_content);
	var uri
	uri = image.attr('src')
	options['image'] = {
		'url': uri,
		'id': Math.floor((Math.random() * 100) + 1)
	}
	data_settings = element.attr('data-settings');
	if (data_settings != undefined && data_settings != null) {
		data_settings = JSON.parse(data_settings);
		result = {...options, ...data_settings};
	}
	else {
		result = {...options};
	}
	return result;
}

function get_video_options(element) {
	var auto, loop, mute, modestbranding, yt_privacy, image_overlay, info, play_btn;
	image_overlay = $('.elementor-custom-embed-image-overlay', element);
	options = {};
	if (image_overlay != null) {
		options['show_image_overlay'] = 'yes';
		data_settings = element.attr('data-settings');
		if(data_settings.indexOf('lightbox') != -1) {
			options['lightbox'] = 'yes';
			info = image_overlay.attr('data-elementor-lightbox');
			info = JSON.stringify(info)['url'];
			img = $('img', image_overlay);
			options['image_overlay'] = {
				'url': img.attr('src'),
				'id': Math.floor((Math.random() * 100) + 1)
			}
		}
		else {
			url = image_overlay.css('background-image');
			options['image_overlay'] = {
				'url': url.substr(4, url.length - 5),
				'id': Math.floor((Math.random() * 100) + 1)
			}
			video_frame = $('iframe', element);
			info = video_frame.attr('src');
			if (info == undefined) {
				options['lazy_load'] = 'yes';
				info = video_frame.attr('data-lazy-load');
			}
		}
	}
	play_btn = $('.elementor-custom-embed-play', element);
	if (play_btn == null) {
		options['show_play_icon'] = '';
	}
	if (info.indexOf('youtube') != -1) {
		link = info.split('&')[0].split('?')[0];
		if(link.indexOf('nocookie') != -1) {
			link.replace('https://www.youtube-nocookie.com/embed/', '');
		} else {
			link.replace('https://www.youtube.com/embed/', '');
		}
		options['youtube_url'] = 'https://www.youtube.com/watch?v=' + link;
		if (info.indexOf('autoplay=1') != -1) {
			options['autoplay'] = 'yes';
		}
		if (info.indexOf('loop=1') != -1) {
			options['loop'] = 'yes';
		}
		if (info.indexOf('mute=1') != -1) {
			options['mute'] = 'yes';
		}
		if (info.indexOf('modestbranding=1') != -1) {
			options['modestbranding'] = 'yes';
		}
		if (info.indexOf('nocookie') != -1) {
			options['yt_privacy'] = 'yes'
		}
	} else if (info.indexOf('vimeo')) {
		options['video_type'] = "vimeo";
		link = info.split('&')[0].split('?')[0];
		link.split('https://player.vimeo.com/video/', '');
		options['vimeo_url'] = 'https://vimeo.com/' + link;
		if (info.indexOf('autoplay=1') != -1) {
			options['autoplay'] = 'yes';
		}
		if (info.indexOf('loop=1') != -1) {
			options['loop'] = 'yes';
		}
		if (info.indexOf('muted=1') != -1) {
			options['mute'] = 'yes';
		}
		if (info.indexOf('color=') != -1) {
			options['color'] = '#' + info.substr(info.indexOf('color=') + 7, 6);
		}
		if (info.indexOf('title=0') != -1) {
			options['vimeo_title'] = '';
		}
		if (info.indexOf('portrait=0') != -1) {
			options['vimeo_portrait'] = ''
		}
		if (info.indexOf('byline=0') != -1) {
			options['vimeo_byline'] = ''
		}
	} else if (info.indexOf('dailymotion') != 0) {
		options['video_type'] = 'dailymotion';
		link = info.split('?')[0];
		link = link.replace('embed/', '');
		options['dailymotion_url'] = link;
		if (info.indexOf('autoplay=1') != -1) {
			options['autoplay'] = 'yes';
		}
		if (info.indexOf('loop=1') != -1) {
			options['loop'] = 'yes';
		}
		if (info.indexOf('muted=1') != -1) {
			options['mute'] = 'yes';
		}
		if (info.indexOf('controls=0')) {
			options['controls'] = '';
		}
		if (info.indexOf('ui-start-screen-info=0')) {
			options['showinfo'] = '';
		}
		if (info.indexOf('ui-logo=0')) {
			options['logo'] = '';
		}
		if (info.indexOf('ui-highlight=') != -1) {
			options['color'] = '#' + info.substr(info.indexOf('ui-highlight=') + 14, 6);
		}
	}
	result = {...options};

	return result;
}

function get_button_options(element) {
	var type, align, size, icon_align, icon, icon_indent;
	var classlist = element.attr('class');
	options = {'text': $('.elementor-button-text', element).text()}
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('elementor-button-') != -1) {
				temp = classlist[i];
				if (type == null || type == 'default')
					type = temp.replace('elementor-button-', '');
			} else if (classlist[i].indexOf('elementor-align-') != -1) {
				temp = classlist[i];
				if (align == null || align == 'default')
				align = temp.replace('elementor-align-', '');
			}
			
		}
	}
	if (type != null)
		options['button_type'] = type;
	if (align != null)
		options['align'] = align;
	btn_content = $('a', element);
	classlist = btn_content.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('elementor-size-') != -1) {
				temp = classlist[i];
				if (size == null || size == 'default')
					size = temp.replace('elementor-size-', '');
			}
		}
	}
	if (size != null) {
		options['size'] = size;
	}
	var icon_content;
	icon_content = $('.elementor-button-icon', btn_content);
	if (icon_content != null) {
		classlist = icon_content.attr('class');
		if (classlist != undefined && classlist != null) {
			classlist = classlist.split(' ');
			for (var i = 0; i < classlist.length; i ++) {
				if (classlist[i].indexOf('elementor-align-icon-') != -1) {
					temp = classlist[i];
					if (icon_align == null || icon_align == 'default')
						icon_align = temp.replace('elementor-align-icon-', '');
						options['icon_align'] = icon_align;
				}
			}
		}
		if (icon_align == 'right') {
			icon_indent = icon_content.css('margin-left');
		}
		if (icon_align == 'left' || icon_align == null) {
			icon_indent = icon_content.css('margin-right');
		}
		var icon_info = $('i', icon_content);
		icon = icon_info.attr('class');
		options['icon'] = icon;
		if(icon_indent != '0px' && icon_indent != null) {
			options['icon_indent'] = strtounit(icon_indent)
		}
		
	}
	return options
}

function get_divider_options(element) {
	var divider_content = $('.elementor-divider-separator', element);
	style = divider_content.css('border-top-style');
	weight = divider_content.css('border-top-width');
	color = divider_content.css('border-top-color');
	width = divider_content.css('width');
	var divider_seperator = $('.elementor-divider', element);
	align = divider_seperator.css('text-align');
	gap = divider_seperator.css('padding-top');
	var options = {};
	options['style'] = style;
	options['weight'] = strtounit(weight);
	options['width'] = strtounit(width);
	options['color'] = color;
	options['align'] = align;
	options['gap'] = strtounit(gap);
	return options;
}

function get_space_options(element) {
	var spacer_div = $('.elementor-spacer-inner', element);
	var options = {};
	options['space'] = strtounit(spacer_div.css('height'));
	return options;
}

function get_gmap_options(element) {
	var gmap_iframe = $('iframe', element);
	var options = {};
	options['address'] = gmap_iframe.attr('aria-label');
	src = gmap_iframe.attr('src');
	zoom = src.substr(src.indexOf('z=') + 2, src.indexOf('&output=') - src.indexOf('z=') - 2) + 'px';
	options['zoom'] = strtounit(zoom);
	options['height'] = strtounit(gmap_iframe.css('height')); 
	return options;
}

function get_icon_options(element) {
	var classlist = element.attr('class');
	var options = {}
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('elementor-view-') != -1) {
				temp = classlist[i];
				options['view'] = temp.replace('elementor-view-', '');
			} else if (classlist[i].indexOf('elementor-shape-') != -1) {
				temp = classlist[i];
				options['shape'] = temp.replace('elementor-shape-', '');
			}
			
		}
	}
	var link_tag = $('a', element);
	options['link'] = {
		'url': link_tag.attr('href'),
		'is_external': link_tag.attr('target') == '_blank' ? 'yes' : '',
		'nofollow': link_tag.attr('rel') == 'nofollow' ? 'yes' : ''
	};
	return options;
}

function get_image_box_options(element) {

	var image_box_img = $('.elementor-image-box-img', element);
	var options = {};
	var link_tag = $('a', image_box_img);
	options['link'] = {
		'url': link_tag.attr('href'),
		'is_external': link_tag.attr('target') == '_blank' ? 'yes' : '',
		'nofollow': link_tag.attr('rel') == 'nofollow' ? 'yes' : ''
	};
	var img_tag = $('img', image_box_img);
	options['image'] = {
		'url': img_tag.attr('src'),
		'id': Math.floor((Math.random() * 100) + 1)
	}

	var image_box_content = $('.elementor-image-box-content', element);
	options['title_text'] = $('.elementor-image-box-title', image_box_content).text();
	options['title_size'] = $('.elementor-image-box-title', image_box_content)[0].tagName.toLowerCase();
	options['description_text'] = $('.elementor-image-box-description', image_box_content).text();
	return options;
}

function get_star_rating_options(element) {
	var classlist = element.attr('class');
	var options = {}
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('elementor-star-rating--align-') != -1) {
				temp = classlist[i];
				options['align'] = temp.replace('elementor-star-rating--align-', '');
			} else if (classlist[i].indexOf('elementor--star-style-') != -1) {
				temp = classlist[i];
				options['star_style'] = temp.replace('elementor--star-style-', '');
			}
		}
	}
	var star_title_div;
	star_title_div = $('.elementor-star-rating__title', element);
	if (star_title_div != null) {
		options['title'] = star_title_div.text();
	}
	options['rating_scale'] = $('.elementor-star-rating i', element).length;
	options["unmarked_star_style"] = "outline";
	return options;
}

function get_image_gallery_options(element) {
	var options = {};
	wp_gallery = [];
	img_list = $('figure a', element);
	for(var i = 0; i < img_list.length; i ++) {
		wp_gallery.push({
			'url' : img_list[i].attr('href'),
			'id' :  Math.floor((Math.random() * 100) + 1)
		});
	}
	options['wp_gallery'] = wp_gallery;
	gallery_settings_div = $('.gallery', element);
	var classlist = gallery_settings_div.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('gallery-columns-') != -1) {
				temp = classlist[i];
				options['gallery_columns'] = temp.replace('gallery-columns-', '');
			}
		}
	}
	return options;
}

function get_icon_list_options(element) {
	var icons_container = $('.elementor-icon-list-items', element);
	var classes = icons_container.attr('class');
	var options = {};
	if(classes.indexOf('elementor-inline-items') != -1) {
		options['view'] = 'inline'
	}
	var icons = $('li', icons_container);
	var icons_list = [];
	for (var i = 0; i < icons.length; i ++) {
		icon_info = {};
		let link, content, text;
		link = $('a', icons.eq(i));
		if (link != null) {
			icon_info['link'] = {
				'url': link.attr('href'),
				'is_external': link.attr('target') == '_blank' ? 'yes' : '',
				'nofollow': link.attr('rel') == 'nofollow' ? 'yes' : ''
			};
		}
		text = $('.elementor-icon-list-text', icons.eq(i));
		if (text != null) {
			icon_info['text'] = text.text();
		}
		content = $('.elementor-icon-list-icon i', icons.eq(i));
		if (content != null) {
			icon_info['icon'] = content.attr('class');
		}
		icon_info['_id'] = Math.floor((Math.random() * 10000) + 1)
		icons_list.push(icon_info);
	}
	options['icon_list'] = icons_list;
	if ($('.elementor-icon-list-icon i', icons.eq(0)).length != 0) {
		options['icon_color'] = convertrgbtohex($('.elementor-icon-list-icon i', icons.eq(0)).css('color'));
		options['icon_size'] = strtounit($('.elementor-icon-list-icon i', icons.eq(0)).css('font-size'));
		options['text_indent'] = strtounit($('.elementor-icon-list-icon i', icons.eq(0)).css('padding-left'));
	}
	if ($('.elementor-icon-list-text', icons.eq(0)).length != 0) {
		options['text_color'] = convertrgbtohex($('.elementor-icon-list-text', icons.eq(0)).css('color'));
	}
	return options;
}

function get_counter_options(element) {
	var options = {};
	options['prefix'] = $('.elementor-counter-number-prefix', element).text();
	options['suffix'] = $('.elementor-counter-number-suffix', element).text();
	options['title'] = $('.elementor-counter-title', element).text();
	var counter_content = $('.elementor-counter-number', element);
	options['ending_number'] = counter_content.attr('data-to-value');
	options['duration'] = counter_content.attr('data-duration');
	options['thousand_separator_char'] = counter_content.attr('data-delimiter');
	return options;
}

function get_process_options(element) {
	var options = {};
	options['title'] = $('.elementor-title', element).text();
	process_wrapper = $('.elementor-progress-wrapper', element);
	options['inner_text'] = process_wrapper.attr('aria-valuetext');
	var classlist = process_wrapper.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('progress-') != -1) {
				temp = classlist[i];
				options['progress_type'] = temp.replace('progress-', '');
			}
		}
	}
	options['percent'] = strtounit(process_wrapper.attr('aria-valuenow') + '%');
	return options;
}

function get_testimonial_options(element) {
	var options = {};
	options['testimonial_content'] = $('.elementor-testimonial-content', element).text();
	var testimonial_image = $('elementor-testimonial-image img', element)
	options['testimonial_image'] = testimonial_image.attr('src');
	var classlist = testimonial_image.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('size-') != -1) {
				temp = classlist[i];
				options['testimonial_image_size'] = temp.replace('size-', '');
			}
		}
	}
	options['testimonial_name'] = $('.elementor-testimonial-name', element).text();
	options['testimonial_job'] = $('.elementor-testimonial-job', element).text();
	var link;
	link = $('.elementor-testimonial-image > a', element);
	if (link != null) {
		options['link'] = {
			'url': link.attr('href'),
			'is_external': link.attr('target') == '_blank' ? 'yes' : '',
			'nofollow': link.attr('rel') == 'nofollow' ? 'yes' : ''
		};
	}
	return options;
}

function get_tabs_options(element) {
	options = {};
	var classlist = element.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('elementor-tabs-view-') != -1) {
				temp = classlist[i];
				options['type'] = temp.replace('elementor-tabs-view-', '');
			}
		}
	}
	var tabs = [];
	var tabs_wrapper = $('.elementor-tabs-wrapper', element);
	var titles = $('.elementor-tab-title', tabs_wrapper);
	var tabs_content_wrapper = $('.elementor-tabs-content-wrapper', element);
	var contents = $('.elementor-tab-content', tabs_content_wrapper);
	for (var i = 0; i < titles.length; i ++) {
		tab_info = {};
		tab_info['tab_title'] = titles.eq(i).text();
		tab_info['tab_content'] = contents.eq(i).html();
		tab_info['_id'] = Math.floor((Math.random() * 10000) + 1);
		tabs.push(tab_info);
	}
	options['tabs'] = tabs;
	return options;
}

function get_accordion_options(element) {
	options = {};
	
	var icon_wrapper;
	icon_wrapper = $('.elementor-accordion-icon', element).eq(0);
	options['title_html_tag'] = $('.elementor-tab-title').eq(0)[0].tagName.toLowerCase();

	if (icon_wrapper != null) {
		var classlist = icon_wrapper.attr('class');
		if (classlist != undefined && classlist != null) {
			classlist = classlist.split(' ');
			for (var i = 0; i < classlist.length; i ++) {
				if (classlist[i].indexOf('elementor-accordion-icon-') != -1) {
					temp = classlist[i];
					options['icon_align'] = temp.replace('elementor-accordion-icon-', '');
				}
			}
		}
		options['icon'] = $('.elementor-accordion-icon-closed', icon_wrapper).attr('class').replace('elementor-accordion-icon-closed ', '');
		options['icon_active'] = $('.elementor-accordion-icon-opened', icon_wrapper).attr('class').replace('elementor-accordion-icon-closed ', '');
	}
	titles = $('.elementor-tab-title a', element);
	contents = $('.elementor-tab-content', element);
	var tabs = [];
	for (var i = 0; i < titles.length; i ++) {
		tab_info = {};
		tab_info['tab_title'] = titles.eq(i).text();
		tab_info['tab_content'] = contents.eq(i).html();
		tab_info['_id'] = Math.floor((Math.random() * 10000) + 1);
		tabs.push(tab_info);
	}
	options['tabs'] = tabs;
	return options;
}

function get_toggle_options(element) {
	options = {};
	
	var icon_wrapper;
	icon_wrapper = $('.elementor-accordion-icon', element).eq(0);
	options['title_html_tag'] = $('.elementor-tab-title').eq(0)[0].tagName.toLowerCase();

	if (icon_wrapper != null) {
		var classlist = icon_wrapper.attr('class');
		if (classlist != undefined && classlist != null) {
			classlist = classlist.split(' ');
			for (var i = 0; i < classlist.length; i ++) {
				if (classlist[i].indexOf('elementor-accordion-icon-') != -1) {
					temp = classlist[i];
					options['icon_align'] = temp.replace('elementor-accordion-icon-', '');
				}
			}
		}
		options['icon'] = $('.elementor-accordion-icon-closed', icon_wrapper).attr('class').replace('elementor-accordion-icon-closed ', '');
		options['icon_active'] = $('.elementor-accordion-icon-opened', icon_wrapper).attr('class').replace('elementor-accordion-icon-closed ', '');
	}
	titles = $('.elementor-tab-title a', element);
	contents = $('.elementor-tab-content', element);
	var tabs = [];
	for (var i = 0; i < titles.length; i ++) {
		tab_info = {};
		tab_info['tab_title'] = titles.eq(i).text();
		tab_info['tab_content'] = contents.eq(i).html();
		tab_info['_id'] = Math.floor((Math.random() * 10000) + 1);
		tabs.push(tab_info);
	}
	options['tabs'] = tabs;
	return options;
}

function get_social_icons_options(element) {
	options = {};
	var classlist = element.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('.elementor-shape-') != -1) {
				temp = classlist[i];
				options['shape'] = temp.replace('.elementor-shape-', '');
			}
		}
	}
	var icons_wrapper = $('.elementor-social-icon', element);
	var social_icon_list = [];
	for (var i = 0; i < icons_wrapper.length; i ++) {
		icon_info = {};
		icon_info['social'] = $('i', icons_wrapper.eq(i)).attr('class');
		icon_info['link'] = {
			'url': icons_wrapper.eq(i).attr('href'),
			'is_external': icons_wrapper.eq(i).attr('target') == '_blank' ? 'yes' : '',
			'nofollow': icons_wrapper.eq(i).attr('rel') == 'nofollow' ? 'yes' : ''
		}
		icon_info['_id'] = Math.floor((Math.random() * 10000) + 1);
		social_icon_list.push(icon_info);
	}
	options['social_icon_list'] = social_icon_list;
	return options;
}

function get_alert_options(element) {
	var options = {};
	alert_container = $('.elementor-alert', element);
	var classlist = alert_container.attr('class');
	if (classlist != undefined && classlist != null) {
		classlist = classlist.split(' ');
		for (var i = 0; i < classlist.length; i ++) {
			if (classlist[i].indexOf('.elementor-alert-') != -1) {
				temp = classlist[i];
				options['alert_type'] = temp.replace('.elementor-alert-', '');
			}
		}
	}
	alert_title = $('elementor-alert-title', alert_container);
	options['alert_title'] = alert_title.text();
	alert_description = $('elementor-alert-description', alert_container);
	options['alert_description'] = alert_description.text();
	var dismiss_btn;
	dismiss_btn = $('button', alert_container);
	if (dismiss_btn.length == 0) {
		options['show_dismiss'] = 'hide';
	}
	return options;
}

function get_html_options(element) {
	var options = {};
	html_container = $('.elementor-widget-container', element);
	options['html'] = html_container.html();
	return options;
}

function get_menu_anchor_options(element) {
	var options = {};
	menu_anchor = $('.elementor-menu-anchor', element);
	options['anchor'] = menu_anchor.attr('id');
	return options;
}

function get_animated_headline_options(element) {
	var options = {};
	data_settings = element.attr('data-settings');
	options = JSON.parse(data_settings);
	options['before_text'] = $('.elementor-headline-plain-text', element).text();
	return options;
}

function get_form_options(element) {
	var options = {};
	form = $('form', element);
	options["form_name"] = form.attr('name');
	form_elements = $('.elementor-form-fields-wrapper', form);
	form_fields = [];
	for(var i = 0; i < form_elements.length; i ++) {
		form_element = form_elements.eq(i);
		if (!form_element.hasClass('.elementor-field-type-submit')) {
			form_field = {};
			form_field['_id'] = $('.elementor-field', form_element).attr('name');
			form_field['_id'] = form_field['_id'].substr(12, form_field['_id'].length - 1);
			form_field['type'] = $('.elementor-field', form_element).attr('type');
			form_field['placeholder'] = $('.elementor-field', form_element).attr('placeholder');
			form_field['field_label'] = $('label', form_element).text();			
			form_fields.push(form_field);
		} else {
			options['button_text'] = form_element.text();
		}
	}
	options['form_fields'] = form_fields;
	options["email_content"] = "[all-fields]";
	options["email_content_2"] = "[all-fields]";
	options["success_message"] = "The form was sent successfully.";
	options["error_message"] =  "An error occured.";
	options["required_field_message"] = "This field is required.";
	options["invalid_message"] = "There's something wrong. The form is invalid.";
	return options;
}

function get_countdown_options(element) {
	var options = {};
	countdown_wrapper = $('.elementor-countdown-wrapper', element);
	data_date = countdown_wrapper.attr('data_date') + '000';
	due_date = new Date(data_date);
	options['due_date'] = due_date.customFormat('#YYYY#-#MM#-#DD# #hh#:#mm#');
	countdown_items = $('.elementor-countdown-item', countdown_wrapper);
	for (var i = 0; i < countdown_items.length; i ++) {
		countdown_item = countdown_items.eq(i);
		value = $('.elementor-countdown-digits', countdown_item);
		classlist = value.attr('class');
		classlist = classlist.split(' ');
		for (var j = 0; j < classlist.length; j ++) {
			if(classlist[j].indexOf('elementor-countdown-') != -1 && classlist[j] != 'elementor-countdown-digits') {
				type = classlist[j].replace('elementor-countdown-');
				options['label_'+type] = $('.elementor-countdown-label', countdown_item).text();
				break;
			}
		}
	}
	return options;
}

function get_slides_options(element) {
	options = {};
	sliders = $('.slick-slide', element);
	height = strtounit(sliders.eq(1).css('height'));
	options['slides_height'] = height;
	count = sliders.length / 2 - 1;
	slides = [];
	for (i = 0; i < count; i ++) {
		slider = $('.slick-slide[data-slick-index="'+ i +'"]', element);
		slide_options = {};
		classlist = slider.attr('class');
		classlist = classlist.split(' ');
		for (j = 0; j < classlist.length; j ++) {
			if (classlist[j].indexOf('elementor-repeater-item-') != -1) {
				slide_options['_id'] = classlist[j].replace('elementor-repeater-item-', '')
			}
		}
		slider_content = $('.elementor-slide-content', slider);
		slide_options['heading'] = $('.elementor-slide-heading',slider_content).text();
		if ($('.elementor-slide-description',slider_content).length > 0)
			slide_options['description'] = $('.elementor-slide-description',slider_content).text();
		if ($('.elementor-slide-button',slider_content).length > 0)
			slide_options['button_text'] = $('.elementor-slide-button',slider_content).text();
		slider_bg = $('.slick-slide-bg', slider);
		slide_options['background_image'] = {
			"url": slider_bg.css('background-image').substr(4, slider_bg.css('background-image').length - 5),
			"id": Math.floor(Math.random() * 100)
		}
		slide_options['background_size'] = slider_bg.css('background-size');
		slide_options['background_color'] = slider_bg.css('background-color');
		classlist = slider_bg.attr('class');
		classlist = classlist.split(' ');
		for (k = 0; k < classlist.length; k ++) {
			if (classlist[k].indexOf('elementor-ken-') != -1) {
				slide_options['background_ken_burns'] = 'yes';
				slide_options['zoom_direction'] = classlist[k].replace('elementor-ken-', '')
			}
		}
		if($('.elementor-background-overlay',slider_content).length > 0) {
			slide_options['background_overlay'] = 'yes';
			slide_options['background_overlay_color'] = $('.elementor-background-overlay',slider_content).css('background-color');
			slide_options['background_overlay_blend_mode'] = $('.elementor-background-overlay',slider_content).css('background-blend-mode') != 'normal' ? 
			$('.elementor-background-overlay',slider_content).css('background-blend-mode') : '';
		}
		if($('.slick-slide-inner', slider)[0].tagName.toLowerCase() == 'a') {
			slide_options['link_click'] = 'slide'
			link = $('.slick-slide-inner', slider)
			slide_options['link'] = {
				'url': link.attr('href'),
				'is_external': link.attr('target') == '_blank' ? 'yes' : '',
				'nofollow': link.attr('rel') == 'nofollow' ? 'yes' : ''
			}		
		} else if($('.elementor-slide-button', slider)[0].tagName.toLowerCase() == 'a') {
			slide_options['link_click'] = 'button'
			link = $('.elementor-slide-button', slider);
			slide_options['link'] = {
				'url': link.attr('href'),
				'is_external': link.attr('target') == '_blank' ? 'yes' : '',
				'nofollow': link.attr('rel') == 'nofollow' ? 'yes' : ''
			}
		} 
		if ($('.elementor-slide-heading', slider_content).css('color') != 'rgb(255, 255, 255)') {
			slide_options['custom_style'] = 'yes'
			slide_options['content_color'] = $('.elementor-slide-heading', slider_content).css('color');
		}
		if ($('.elementor-slide-inner', slider).css('text-align') != 'center') {
			slide_options['custom_style'] = 'yes'
			slide_options['text_align'] = $('.elementor-slide-inner', slider).css('text-align')
		}
		console.log($('.elementor-slide-inner', slider).css('align-items'));
		if ($('.elementor-slide-inner', slider).css('align-items') != 'center') {
			slide_options['custom_style'] = 'yes'
			if($('.elementor-slide-inner', slider).css('align-items') == 'flex-start')
				slide_options['vertical_position'] = 'top'
			if($('.elementor-slide-inner', slider).css('align-items') == 'flex-end')
				slide_options['vertical_position'] = 'bottom'
		}
		console.log(slider_content.css('margin-left'));
		if (slider_content.css('margin-left') == 'auto') {
			slide_options['custom_style'] = 'yes'
			slide_options['horizontal_position'] = 'right'
		}
		if (slider_content.css('margin-right') == 'auto') {
			slide_options['custom_style'] = 'yes'
			slide_options['horizontal_position'] = 'left'
		}
		slides.push(slide_options);
	}
	options['slides'] = slides;
	return options;
}

function get_element_options(element, element_type) {
	switch(element_type) {
		case 'section':
			return get_section_options(element);
			break;
		case 'column':
			return get_column_options(element);
			break;
		case 'heading':
			return get_heading_options(element);
			break;
		case 'text-editor':
			return get_text_editor_options(element);
			break;
		case 'image':
			return get_image_options(element);
			break;
		case 'video':
			return get_video_options(element);
			break;
		case 'button':
			return get_button_options(element);
			break;
		case 'divider':
			return get_divider_options(element);
			break;
		case 'space':
			return get_space_options(element);
			break;
		case 'google_maps':
			return get_gmap_options(element);
			break;
		case 'icon':
			return get_icon_options(element);
			break;
		case 'image-box':
			return get_image_box_options(element);
			break;
		case 'star-rating':
			return get_star_rating_options(element);
			break;
		case 'image-gallery':
			return get_image_gallery_options(element);
			break;
		case 'icon-list':
			return get_icon_list_options(element);
			break;
		case 'counter':
			return get_counter_options(element);
			break;
		case 'process':
			return get_process_options(element);
			break;
		case 'testimonial':
			return get_testimonial_options(element);
			break;
		case 'tabs':
			return get_tabs_options(element);
			break;
		case 'accordion':
			return get_accordion_options(element);
			break;
		case 'toggle':
			return get_toggle_options(element);
			break;
		case 'social-icons':
			return get_social_icons_options(element);
			break;
		case 'alert':
			return get_alert_options(element);
			break;
		case 'html':
			return get_html_options(element);
			break;
		case 'menu-anchor':
			return get_menu_anchor_options(element);
			break;
		case 'animated-headline':
			return get_animated_headline_options(element);
			break;
		case 'form':
			return get_form_options(element);
			break;
		case 'countdown':
			return get_countdown_options(element);
			break;
		case 'slides':
			return get_slides_options(element);
			break;
		default:
			a = {};
			return a;
	}
}

function check_inner(classlist) {
	for(var i = 0; i < classlist.length; i ++) {
		if(classlist[i].indexOf('elementor-inner') != -1) 
			return true;
	}
	return false;
}

function check_elementor(element, order = -1) {
    var element_list = ['accordion', 'alert', 'audio', 'button', 'counter', 'divider', 'google_maps', 'heading', 'html', 'icon-box', 'icon-list', 
    'icon', 'image-box', 'image-carousel', 'image-gallery', 'image', 'menu-anchor', 'nav-menu', 'progress', 'shortcode', 'spacer','social-icons', 'star-rating', 'tabs', 'testimonial',
	'text-editor', 'toggle', 'video','column', 'testimonial', 'section', 'slides', 'portfolio', 'posts', 'form', 'login', 'animated-headline', 'price-list', 'price-table', 'filp-box',
	'filp-box', 'call-to-action', 'media-carousel', 'testerminal-carousel', 'countdown', 'share-buttons', 'block-quote', 'facebook-button', 'facebook-comments', 'facebook-embed', 
	'facebook-page', 'template', 'site-logo', 'site-title', 'page-title', 'search-form'];
	
    var return_val, type, id, items, options, inner, wi_type, result;
    var data_id = element.attr('data-id');
    if (data_id != undefined) {
		
		var classlist = element.attr('class');
		if(classlist != undefined && classlist != null) {
			classlist = classlist.split(' ');
			for (var i = 0; i < classlist.length; i ++) {
				for(var j = 0; j < element_list.length; j ++)
				if (classlist[i].indexOf('elementor-widget-'+element_list[j]) != -1 || classlist[i].indexOf('elementor-'+element_list[j]) != -1) {
					
					if (classlist.indexOf('elementor-widget') != -1) {
						type = 'widget';
						wi_type = element_list[j]
						options = get_element_options(element, wi_type);
					}
					else {
						type = element_list[j];
						options = get_element_options(element, type);
					}
					id = data_id;
					inner = check_inner(classlist);
					break;
				}
			}
		} 
    }
    for (var i = 0; i < element.children().length; i ++) {
        result = check_elementor(element.children().eq(i), i);
        if (result != null) {
            if (items != null) {
				if (Array.isArray(items)) {
					items.push(result);
				} else {
					temp = [];
					temp.push(items);
					temp.push(result);
					items = temp;
				}
            }
            else {
				items = result;
            }
        }
	}
	if(items != null && Array.isArray(items)) {
		items.sort(function(a, b){return a.order < b.order})
	}
    if (type != null) {
		return_val = {};
		return_val['id'] = id;
		return_val['settings'] = options;
		if (items == null)
			items = [];
		else if(!Array.isArray(items)) {
			temp = [];
			temp.push(items);
			items = temp;
		}
		return_val['elements'] = items;
		return_val['isInner'] = inner;
		return_val['elType'] = type;
		if(type == 'widget') {
			return_val['widgetType'] = wi_type;
		}
		return_val['order'] = order;
        return return_val;
    }
    else {
        return items;
    }
}

function search_elementor_template(element) {
	if(element.hasClass('elementor')) {
		var data_elementor_type = element.attr('data-elementor-type');
		var elementor_id = element.attr('data-elementor-id');
		var remove_class='.';
		if(elementor_id != null) {
			remove_class +='elementor-'+elementor_id;
		} else {
			classlist = element.attr('class');
			remove_class += classlist.split(' ')[1];
		}
		var content = check_elementor(element);
		if(!Array.isArray(content)) {
			temp = [];
			temp.push(content);
			content = temp;
		}
		var title = document.title;
		result = {};
		result['version'] = '0.4';
		result['title'] = title;
		result['type'] = data_elementor_type != null ? data_elementor_type : 'page';
		result['content'] = content;
		result['page_settings'] = {'custom_css': getAllCss()['css'].trim().replace(/[\r\n\t]+/g, '').split(remove_class).join('')};
		var _myArray = JSON.stringify(result , null, 4);
		var vLink = document.createElement('a'),
		vBlob = new Blob([_myArray], {type: "octet/stream"}),
		vName = 'decompile_elementor.json',
		vUrl = window.URL.createObjectURL(vBlob);
		vLink.setAttribute('href', vUrl);
		vLink.setAttribute('download', vName );
		vLink.click();
		console.log(result);
	}
	else {
		for (var i = 0; i < element.children().length; i ++) {
			search_elementor_template(element.children().eq(i));
		}
	}
}
$(document).ready(function() {
	setTimeout(function() {
		search_elementor_template($('body'));
	}, 4000)
});
