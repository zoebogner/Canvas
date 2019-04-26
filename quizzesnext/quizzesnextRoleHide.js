/**
* Hide Quizzes.Next iframe from any user with the specified role.
*
* When attempting to access a Quizzes.Next quiz, this code makes an API call
* to retrieve the user's roles. If a users assigned role matches whats defined 
* in the 'role' variable, the user will see an "Access Denied" message. 
* The user can grade Quizzes.Next submissions via SpeedGrader. 
*
* @author Zoe Bogner
*/ 

if (typeof jQuery == 'undefined' || typeof jQuery === undefined || typeof jQuery === null) {
    var headTag = document.getElementsByTagName("head")[0];
    var jqTag = document.createElement('script');
    jqTag.type = 'text/javascript';
    jqTag.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js';
    headTag.appendChild(jqTag);
    jqTag.onload = myJQueryCode;
} else {
    myJQueryCode();
}

function myJQueryCode(){
    $(document).ready(function() {

        // Hide Quizzes.Next from users with this role:
        var role = "TaEnrollment";

        var userRole;
        var course = null;
        var actionUrl = $('#tool_form').attr('action');

        
        if(ENV.context_asset_string !== null)
        {
            course = ENV.context_asset_string.split("course_").join("");
        }
        // Only execute if we're inside a course and and loading an LTI element.
        if( (actionUrl !== undefined) && (actionUrl !== null) && (course !== undefined) && (course !== null) ) {
                
            /* The Quizzes.Next LTI page includes a <form> element with an action attribute, eg:
            *  https://yourinstitution.quiz-lti-syd-prod.instructure.com/lti/launch
            *  To know if we're on a Quizzes.Next page, we check the action attribute contains two pieces.
            *
            *  indexOf returns the position of the matching string, or -1 if not found.
            */
            var matchFirst = actionUrl.indexOf("quiz-lti-");
            var matchSecond = actionUrl.indexOf(".instructure.com/lti/launch");

            if ( (matchFirst >= 0) && (matchSecond >= 0) ){
                // API call to check the user's current role(s)
                $.getJSON('/api/v1/courses/' + course + '/enrollments?user_id=' + ENV['current_user_id'], function(data) {
                    for (var i = 0; i < data.length; i++) {
                        userRole = data[i].role;
                        // Check if the user's Canvas role matches ours
                        if (userRole == role) {
                            // Remove the Quizzes.Next iframe
                            $("iframe#tool_content").remove();
                            // Display an "Access Denied" message after 2 second delay.
                            // When a user is in SpeedGrader, the Quizzes.Next iframe loads briefly before it's replaced by the SpeedGrader interface.
                            // We'll remove the iframe, display a small loading animation for two seconds, then replace the animation with an "Access Denied" message.
                            $(".tool_content_wrapper").append('<div class="rolehideloader" style="text-align: center; margin-top: 5rem;"><img src="/images/ajax-loader-linear.gif" alt="Loading"></div>');
                            setTimeout(function(){
                                $(".rolehideloader").remove();
                                $(".tool_content_wrapper").append('<div id="unauthorized_message" class="ic-Error-page"><img class="ic-Error-img" role="presentation" alt="" aria-hidden="true" src="/images/401_permissions.svg"><h1>Access Denied</h1><p>You don\'t have access to view this resource.</p></div>');
                            }, 2000);
                        }
                    }
                });
            }
        }
    });
}