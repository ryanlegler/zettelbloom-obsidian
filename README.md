# ZettelBloom-Obsidian Plugin

## Introduction

The ZettelBloom-Obsidian plugin is designed to assist in the execution of the ZettelBloom principles of gathering, reconciling, and optimizing note-taking and knowledge management within the Obsidian platform. It provides functionalities to process links, create dedicated pages for resources, and optimize link handling within your notes.

## Features

1. **Link Processing:** Automatically creates dedicated files for each incoming link, enhancing organization and accessibility.
2. **Embedded Link Strategy:** Utilizes an embedded link strategy for pasting links, facilitating easy referencing and interconnectedness within notes.
3. **External Service Integration:** Supports integration with external services, currently only Raindrop.io for seamless link capturing and organization.
4. **TopicTag-Based Organization:** Utilizes topic-tags for categorization and organization, with topic-tags based files and also dataview queryable properties
5. **In-Place Link Extraction:** Enables extraction and saving of links directly from text, offering flexibility in link management.

## Installation

To install the ZettelBloom plugin, follow these steps:

1. Download the plugin from [GitHub repository](link-to-repo).
2. Open Obsidian and navigate to Settings > Community Plugins.
3. Click "Open plugin folder" and copy the downloaded plugin folder into this directory.
4. Restart Obsidian and enable the ZettelBloom plugin from the Community Plugins tab.

## Usage

### For Users

1. **Link Processing:**
    - Incoming links are automatically processed and assigned dedicated files/pages.
    - Preview snippets with title, link, image, and description are generated for enhanced readability.
2. **Embedded Link Strategy:**
    - Pasting links embeds the corresponding file, promoting interconnectedness and easy navigation.
3. **External Service Integration:**
    - Configure Raindrop.io integration by providing collection ID and token for seamless link capturing.

### For Contributors

1. **Development Setup:**
    - Clone the repository from [GitHub](link-to-repo).
    - Install dependencies using `npm install`.
    - Run the plugin locally using `npm run dev`.
2. **Contribution Guidelines:**
    - Fork the repository and create a new branch for your changes.
    - Submit pull requests with clear descriptions of your contributions.

## Configuration

1. **Raindrop.io Integration:**
    - Provide collection ID and token for link capturing from Raindrop.io.
    - Configure topic tags to organize resources based on categories.
2. **In-Place Extraction:**
    - Define the path for the root inbox file and configure optional tagging for link organization.
3. **External Service Data Sync:**
    - Enable/disable data sync to an external service for duplicate detection and synchronization.
    - Set auto-sync frequency and manual sync options for data management.

## Additional Notes

1. **Icon and Command Pallet:**
    - An icon is added to the sidebar for quick access to plugin functionalities.
    - Access additional commands and snippets from the command pallet.
2. **Keyboard Shortcuts:**
    - Configure keyboard shortcuts for opening the command pallet and executing specific commands.

## Support and Feedback

For support or feedback, please [create an issue](link-to-issue-tracker) on GitHub or reach out to [developer's contact info].

---

Feel free to modify and expand upon this template as needed to best fit your plugin's functionality and usage instructions!
