/*
 * jQuery Plugin: clearOnFocus
 * Version 1.0
 *
 * Copyright (c) 2009 David Comeau (http://www.davecomeau.net)
 * Licensed jointly under the GPL and MIT licenses.
 *
 */

(function($) {
	$.fn.clearOnFocus = function() {
		
		function clearOnFocusFocus(event)
		{
			if($(this).val() == $(this).data('clearOnFocus'))
			{
				$(this).val('');
			}
		}
		
		function clearOnFocusBlur(event)
		{
			if($.trim($(this).val()) == '')
			{
				$(this).val($(this).data('clearOnFocus'));
			}
		}
		
		return this.each(function()
			{
				$(this).data('clearOnFocus', $(this).attr('value'));
				
				//	unbind any previous listeners
				$(this).unbind('focus', clearOnFocusFocus);
				$(this).unbind('blur', clearOnFocusBlur);
				
				//	bind listeners to the functions
				$(this).bind('focus', clearOnFocusFocus);
				$(this).bind('blur', clearOnFocusBlur);
			}
		);
	};
})(jQuery);