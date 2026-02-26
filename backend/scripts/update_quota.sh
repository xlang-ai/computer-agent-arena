#!/bin/bash
export DB_HOST="agentarena-database.cj0y8aw6qetg.us-west-1.rds.amazonaws.com"
export DB_USER="arena_master"
export DB_PASSWORD="XLANG2024!"
/home/ubuntu/anaconda3/envs/agent-arena-backend/bin/python /home/ubuntu/workspace/VLMAgentArena/backend/scripts/update_quota.py