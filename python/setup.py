from setuptools import setup

setup(
    name='sns_sdk_python',
    version='0.1.0',

    description='A Python SDK for interacting with the Solana Name Service (SNS)',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',


    url='https://github.com/Bonfida/sns-sdk/tree/main/python',
    project_urls={
        'Documentation': 'https://github.com/Bonfida/sns-sdk/tree/main/python#readme',
        'Source': 'https://github.com/Bonfida/sns-sdk/tree/main/python',
        'Tracker': 'https://github.com/Bonfida/sns-sdk/tree/main/python/issues',
    },

    license='MIT',

    keywords='solana sns sdk blockchain',

    install_requires=[],

    entry_points={
        'console_scripts': [
            'sample=sample:main',
        ],
    },
)
