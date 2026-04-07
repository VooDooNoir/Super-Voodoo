import os
import logging
from cron.jobs import create_job
from hermes_constants import get_hermes_home

# Set HERMES_HOME to ensure the job is created in the correct location
os.environ['HERMES_HOME'] = str(get_hermes_home())

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_blog_cron():
    try:
        # Task: Implement 3-hour automated blog posting to FB and LinkedIn.
        # We create a cron job that instructs the agent to handle the posting.
        # The agent can then use its existing social posting skills (if available)
        # or search for them.
        
        job_prompt = (
            "Check for the latest blog posts and post them to Facebook and LinkedIn. "
            "Ensure the posts are engaging and include the correct links. "
            "If no new posts are found, respond with [SILENT]."
        )
        
        job = create_job(
            prompt=job_prompt,
            schedule='every 3h',
            name='Automated Blog Posting',
            deliver='local' # Set to local for now; can be changed to a specific channel if needed.
        )
        
        logger.info(f"Successfully created cron job: {job['name']} (ID: {job['id']})")
        logger.info(f"Schedule: {job['schedule_display']}")
        
    except Exception as e:
        logger.error(f"Failed to create blog posting cron job: {e}")

if __name__ == '__main__':
    setup_blog_cron()
