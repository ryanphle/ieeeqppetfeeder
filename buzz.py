import RPi.GPIO as GPIO
import time
import logging

Buzzer = 12

CL = [0, 131, 147, 165, 175, 196, 211, 248]
CH = [0, 525, 589, 661, 700, 786, 882, 990]

curr_time = time.clock()
next_time = time.clock() + .05

def setup():
        GPIO.setmode(GPIO.BOARD)
        GPIO.setup(12, GPIO.OUT)
	global Buzz
	Buzz = GPIO.PWM(Buzzer, 440)
        Buzz.start(0)

def loop():
        Buzz.start(50)
	while time.clock() < next_time:
            print time.clock()
            logging.info('log')
	    """
                for i in range(1,len(CL)):
			Buzz.ChangeFrequency(CH[i])
			time.sleep(0.5)
            """
	    time.sleep(1)
        Buzz.stop()
        print 'done'

def destroy():
    Buzz.stop()
    GPIO.output(12, 0)
    GPIO.cleanup()

setup()
loop()
destroy()
"""
if __name__ == '__main__':
	setup()
	try:
		loop()
	except KeyboardInterrupt:
		destory()
"""		
