/*
 * MIT License
 *
 * Copyright (c) 2024-2025 Diego Schivo
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package com.janilla.todomvc.test;

import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Collectors;

import javax.net.ssl.SSLContext;

import com.janilla.http.HttpExchange;
import com.janilla.http.HttpHandler;
import com.janilla.http.HttpServer;
import com.janilla.json.MapAndType;
import com.janilla.net.Net;
import com.janilla.reflect.Factory;
import com.janilla.todomvc.TodoMvc;
import com.janilla.util.Util;
import com.janilla.web.ApplicationHandlerBuilder;
import com.janilla.web.Handle;
import com.janilla.web.Render;

@Render(template = "index.html")
public class TodoMvcTest {

	public static void main(String[] args) {
		try {
			var pp = new Properties();
			try (var s1 = TodoMvcTest.class.getResourceAsStream("configuration.properties")) {
				pp.load(s1);
				if (args.length > 0) {
					var p = args[0];
					if (p.startsWith("~"))
						p = System.getProperty("user.home") + p.substring(1);
					try (var s2 = Files.newInputStream(Path.of(p))) {
						pp.load(s2);
					}
				}
			}
			var x = new TodoMvcTest(pp);
			HttpServer s;
			{
				SSLContext c;
				try (var is = Net.class.getResourceAsStream("testkeys")) {
					c = Net.getSSLContext("JKS", is, "passphrase".toCharArray());
				}
				s = x.factory.create(HttpServer.class, Map.of("sslContext", c, "handler", x.handler));
			}
			var p = Integer.parseInt(x.configuration.getProperty("todomvc.server.port"));
			s.serve(new InetSocketAddress(p));
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}

	public Properties configuration;

	public Factory factory;

	public TodoMvc main;

	public HttpHandler handler;

	public MapAndType.TypeResolver typeResolver;

	public Set<Class<?>> types;

	public TodoMvcTest(Properties configuration) {
		this.configuration = configuration;

		types = Util.getPackageClasses(getClass().getPackageName()).collect(Collectors.toSet());
		factory = new Factory(types, this);
		typeResolver = factory.create(MapAndType.DollarTypeResolver.class);

		main = new TodoMvc(configuration);

		{
			var b = factory.create(ApplicationHandlerBuilder.class);
			var h = b.build();
			handler = x -> {
				var ex = (HttpExchange) x;
//				System.out.println(
//						"TodoMvcTest, " + ex.getRequest().getPath() + ", Test.ongoing=" + Test.ongoing.get());
				var h2 = Test.ONGOING.get() && !ex.getRequest().getPath().startsWith("/test/") ? main.handler : h;
				return h2.handle(ex);
			};
		}
	}

	@Handle(method = "GET", path = "/")
	public TodoMvcTest application() {
		return this;
	}
}
