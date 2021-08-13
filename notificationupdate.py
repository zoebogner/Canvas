#!/usr/bin/python

# Zoe Bogner, Instructure Inc. - 2020.05.31

import requests # https://pypi.org/project/requests/
import json

# API Token
# Instructions to generate a token: https://community.canvaslms.com/t5/Admin-Guide/How-do-I-manage-API-access-tokens-as-an-admin/ta-p/89 
token      = "API-TOKEN" 
# API User requires permissions to do the following:
# - Act as user
# - Users - manage login details
# - Users - view list

# Canvas URL
domain     = "yoursite.instructure.com"

# Subaccount to target (default = '1')
account_id = '1'


##############################################################################


REQUEST_HEADERS    = {'Authorization' : 'Bearer ' + '%s' % token}
API = 'https://' + domain + '/api/v1/'


# Get all users
users = []
users_endpoint = API + 'accounts/%s/users' % (account_id)

# Results are paginated. Iterate over pages until all records retrieved 
not_done = True
while not_done:
    user_request = requests.get(users_endpoint,headers=REQUEST_HEADERS)
    users+=user_request.json()
    users_formatted_json = json.dumps(users, indent=2)
    print(users_formatted_json)
    print(user_request.links)
    if 'next' in user_request.links.keys():
        users_endpoint = user_request.links['next']['url']
    else:
        not_done = False

# Print how many users were found
print ("=> Done getting users. " + str(len(users)) + " users found")

# Load the response as JSON
response_data = users

# Exit if there were no users in the returned data
if not response_data:
  print ('No users found.')
  exit(0)

# Loop through the users, populating the user_ids list with their canvas ids
user_ids = [s['id'] for s in response_data]
for user in user_ids:
    # Get user's communication channel
    com_channel_endpoint = API + 'users/%s/communication_channels' % user
    com_request = requests.get(com_channel_endpoint,headers=REQUEST_HEADERS)
    com_channels = []
    com_channels+=com_request.json()

    # debug
    #com_requests_formatted = json.dumps(com_channels, indent=2)
    #print(com_requests_formatted)

    #update each channel to disable all 'new_account_user' notifications
    for channel in com_channels:
        print("=> Updating user: '%s' Communication channel: '%s' Channel type: '%s'" % (user, channel['id'], channel['type']))

        pref_endpoint = API + 'users/self/communication_channels/%s/notification_preferencs/new_account_user?as_user_id=%s&notification_preferences[frequency]=never' % (channel['id'], user)
        pref_request = requests.put(pref_endpoint, headers=REQUEST_HEADERS)

print ("User update complete")