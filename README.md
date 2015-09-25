This is a programming assignment for Shippable.

Live URL: http://shippable-51981.onmodulus.net/

Summary:<br>
1) Used git search API for fetching the no of open issues whithin a given date range<br>
2) Git calls are made asynchronously to fetch the required data in various date ranges<br>
3) Used eventEmitter to manage the asynchronous callbacks<br>
4) Used jade view engine to render the data from server<br>
5) Error cases like invalid repository are handled<br>
6) NOTE: Can also use async library for managing the asynchronous calls. But for the given requirement,
	eventEmitter was sufficient. Given more time, git API rate limit can be handled.
