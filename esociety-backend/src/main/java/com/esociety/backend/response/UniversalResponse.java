package com.esociety.backend.response;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UniversalResponse {
	@Autowired
	private final WebResponseWrapper responseWrapper;
	
	public ResponseEntity<?> send(String message, Object data, HttpStatus httpStatus){
		responseWrapper.setData(data);
		responseWrapper.setMessage(message);
		return new ResponseEntity<>(responseWrapper,httpStatus);
	}
	
	
	
	
}
