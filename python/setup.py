from setuptools import setup, find_packages

setup(
    # Basic package information:
    name='sns_sdk_python',  # Package name
    version='0.1.0',  # Version number

    # Package description:
    description='A Python SDK for interacting with the Solana Name Service (SNS)',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',


    # URL to the repository and documentation:
    url='https://github.com/Bonfida/sns-sdk/tree/main/python',
    project_urls={
        'Documentation': 'https://github.com/Bonfida/sns-sdk/tree/main/python#readme',
        'Source': 'https://github.com/Bonfida/sns-sdk/tree/main/python',
        'Tracker': 'https://github.com/Bonfida/sns-sdk/tree/main/python/issues',
    },

    license='MIT',

    keywords='solana sns sdk blockchain',

    install_requires=[],


    # To provide executable scripts, use entry points in preference to the
    # "scripts" keyword. Entry points provide cross-platform support and allow
    # pip to create the appropriate form of executable for the target platform.
    entry_points={
        'console_scripts': [
            'sample=sample:main',
        ],
    },
)
