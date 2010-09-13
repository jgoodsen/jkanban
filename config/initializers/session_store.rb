# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_jkanban_session',
  :secret      => '69228a50aa70209a2176d7c744f08659cc382d1d6e0d1231be7d1d280b0e7bd4f0df36426fcb2baeba827de7ec99ca413889549b830814d1afac0458c0b47fdc'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
