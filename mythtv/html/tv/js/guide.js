
/*!
 * \namespace MythGuide
 * \brief Namespace for functions used in the 'Guide' page, guide.qsp
 */
var MythGuide = new function() {

    /*!
    * \fn Init
    * \public
    *
    * Initialise, called by the window load event once the page has finished
    * loading
    */
    this.Init = function()
    {
        RegisterMythEventHandler();
    };

    /*!
    * \fn Destructor
    * \public
    */
    this.Destructor = function()
    {
        DeregisterMythEventHandler();
    };

    /*!
    * \fn RecordProgram
    * \public
    * \param int Channel ID
    * \param string Programme start time
    * \param string Recording rule type
    * \brief Quick schedule
    *
    * Create an instant schedule, with the given type for the programme
    * indentified by the chanID and startTime combo.
    *
    * The schedule editor isn't displayed
    */
    this.RecordProgram = function (chanID, startTime, type)
    {
        hideMenu("optMenu");
        var url = "/tv/ajax_backends/dvr_util.qsp?_action=simpleRecord&chanID=" + chanID + "&startTime=" + startTime + "&type=" + type;
        var ajaxRequest = $.ajax( url )
                                .done(function()
                                {
                                    var response = ajaxRequest.responseText.split("#");
                                    recRuleChanged( response[0], response[1] );
                                });
    }

   /*!
    * \fn MovePage
    * \public
    * \param string Direction, 'left' or 'right'
    * \brief Change the displayed page l
    */
    this.MovePage = function (direction)
    {
        var INTERVAL = 4; // 2 Hours, 30 Minute time periods
        var timeSelect = document.getElementById("guideStartTime");
        var timeIndex = timeSelect.selectedIndex;
        // oldIndex lets us adjust the animation depending on whether we're moving
        // backwards or forwards in time
        timeSelect.setAttribute('data-oldIndex', timeIndex);
        var dateSelect = document.getElementById("guideStartDate");
        var dateIndex = dateSelect.selectedIndex;
        // oldIndex lets us adjust the animation depending on whether we're moving
        // backwards or forwards in time
        dateSelect.setAttribute('data-oldIndex', dateIndex);

        if (direction == "left")
        {
            if ((timeIndex - INTERVAL) < 0)
            {
                timeIndex = (timeIndex - INTERVAL) + timeSelect.length;
                dateIndex = dateIndex - 1;

                if (dateIndex < 0)
                {
                    timeIndex = 0;
                    dateIndex = 0;
                }
            }
            else
                timeIndex = (timeIndex - INTERVAL);
        }
        else if (direction == "right")
        {
            if ((timeIndex + INTERVAL) >= timeSelect.length)
            {
                timeIndex = (timeIndex + INTERVAL) - timeSelect.length;
                dateIndex = dateIndex + 1;

                if (dateIndex >= dateSelect.length)
                {
                    timeIndex = (timeSelect.length - 1);
                    dateIndex = (dateSelect.length - 1);
                }
            }
            else
                timeIndex = timeIndex + INTERVAL;
        }

        dateSelect.selectedIndex = dateIndex;
        timeSelect.selectedIndex = timeIndex;
        // If the date has changed, then use the dateSelect onChange handler
        // instead
        if (dateSelect.getAttribute('data-oldIndex') != dateSelect.selectedIndex)
            dateSelect.onchange();
        else
            timeSelect.onchange();
    }

   /*!
    * \fn ChangeGuideStartTime
    * \public
    * \param object DOM select box element containing date or time
    * \brief Load guide data starting at a given date and time
    */
    this.ChangeGuideStartTime = function(selectBox)
    {
        var oldIndex = selectBox.getAttribute('data-oldIndex');

        if (typeof oldIndex === "undefined" || oldIndex == null)
            oldIndex = selectBox.defaultIndex;

        // oldIndex lets us adjust the animation depending on whether we're moving
        // backwards or forwards in time
        selectBox.setAttribute('data-oldIndex', selectBox.selectedIndex);

        var transition = (selectBox.selectedIndex > oldIndex) ? 'left' : 'right';
        console.log("New " + selectBox.selectedIndex + " Old " + oldIndex + " Transition " + transition);

        submitForm(selectBox.form, 'guideGrid', transition);//     fixGuideHeight();
    }

   /*!
    * \fn SubmitGuideForm
    * \public
    * \param object DOM form object
    * \brief Submit the given form, triggering appropriate animation
    */
    this.SubmitGuideForm = function(form)
    {
        submitForm(form, 'guideGrid', 'dissolve');
    }

   /*!
    * \fn ReloadGuideContent
    * \private
    * \brief Reload the guide data
    */
    var ReloadGuideContent = function()
    {
        loadTVContent(window.location.href, "guideGrid", "dissolve", {"GuideOnly": "1"});
    }

    /*!
     * \var wsClient
     * \private
     * WebSocketEventClient object
     */
    var wsClient = {};

    /*!
    * \fn RegisterMythEventHandler
    * \private
    *
    * Register a WebSocketEventClient with the global WebSocketEventHandler
    */
    var RegisterMythEventHandler = function()
    {
        wsClient = new parent.WebSocketEventClient();
        wsClient.name = "Programme Guide";
        wsClient.eventReceiver = function(event) { HandleMythEvent(event) };
        wsClient.filters = ["SCHEDULE_CHANGE"];
        parent.globalWSHandler.AddListener(wsClient);
    };

    /*!
    * \fn DeregisterMythEventHandler
    * \private
    *
    * Deregister a WebSocketEventClient with the global WebSocketEventHandler
    */
    var DeregisterMythEventHandler = function()
    {
        parent.globalWSHandler.RemoveListener(wsClient);
    };

    /*!
    * \fn HandleMythEvent
    * \private
    *
    * Handle an incoming MythEvent from the WebSocketEventHandler
    */
    var HandleMythEvent = function(event)
    {
        var tokens = event.split(" ");
        if (!tokens.length)
            return;
        // TODO: Add some information to the event so we can decide whether
        // the current page needs reloading. The schedule change may not
        // affect what is current displayed
        if (tokens[0] == "SCHEDULE_CHANGE")
        {
            ReloadGuideContent();
        }
    };
};

window.addEventListener("load", MythGuide.Init);
window.addEventListener("unload", MythGuide.Destructor);
